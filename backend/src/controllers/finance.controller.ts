import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { InvoiceStatus } from '@prisma/client'
import { getPaginationParams, paginatedResponse } from '../lib/pagination'
import { generateInvoicePDF, generateReportPDF } from '../services/pdfGenerator.service'

// ── Schemas ──
const invoiceSchema = z.object({
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'وصف البند مطلوب'),
        amount: z.number().positive('المبلغ لازم يكون أكبر من صفر'),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, 'لازم يكون في بند واحد على الأقل'),
})

const expenseSchema = z.object({
  description: z.string().min(2, 'وصف المصروف مطلوب'),
  amount: z.number().positive('المبلغ لازم يكون أكبر من صفر'),
  category: z.string().min(1, 'نوع المصروف مطلوب'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  receipt: z.string().optional(),
})

// ── توليد رقم الفاتورة تلقائياً ──
async function generateInvoiceNumber(orgId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: { organizationId: orgId },
  })
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`
}

// ── GET /api/finance/invoices ──
export async function getInvoices(req: AuthRequest, res: Response) {
  try {
    const { status, clientId, page, limit } = req.query
    const { skip, take, page: p, limit: l } =
      getPaginationParams({ page, limit })

    const where: any = { organizationId: req.user!.organizationId }
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          client: { select: { id: true, name: true, phone: true } },
          case: { select: { id: true, title: true, caseNumber: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ])

    return res.json(paginatedResponse(invoices, total, p, l))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الفواتير' })
  }
}

// ── POST /api/finance/invoices ──
export async function createInvoice(req: AuthRequest, res: Response) {
  try {
    const data = invoiceSchema.parse(req.body)

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0
    )

    const invoiceNumber = await generateInvoiceNumber(
      req.user!.organizationId
    )

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        status: 'DRAFT',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes?.trim() || null,
        organizationId: req.user!.organizationId,
        clientId: data.clientId || null,
        caseId: data.caseId || null,
        items: {
          create: data.items.map(item => ({
            description: item.description.trim(),
            amount: item.amount,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
        client: { select: { id: true, name: true } },
        case: { select: { id: true, title: true } },
      },
    })

    return res.status(201).json({
      message: 'تم إنشاء الفاتورة بنجاح',
      invoice,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إنشاء الفاتورة' })
  }
}

// ── PUT /api/finance/invoices/:id ──
export async function updateInvoice(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الفاتورة غير موجودة' })
    }

    if (existing.status === 'CANCELED') {
      return res.status(400).json({ error: 'لا يمكن تعديل فاتورة ملغاة' })
    }

    const { status, dueDate, notes } = req.body

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status: status as InvoiceStatus }),
        ...(status === 'PAID' && { paidDate: new Date() }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
      include: { items: true },
    })

    return res.json({
      message: 'تم تحديث الفاتورة بنجاح',
      invoice: updated,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث الفاتورة' })
  }
}

// ── DELETE /api/finance/invoices/:id ──
export async function deleteInvoice(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح' })
    }

    const existing = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الفاتورة غير موجودة' })
    }

    // Soft cancel بدل الحذف للمحافظة على السجل المالي
    await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'CANCELED' },
    })

    return res.json({ message: 'تم إلغاء الفاتورة بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}

// ── GET /api/finance/expenses ──
export async function getExpenses(req: AuthRequest, res: Response) {
  try {
    const { category, from, to, page, limit } = req.query
    const { skip, take, page: p, limit: l } =
      getPaginationParams({ page, limit })

    const where: any = {
      organizationId: req.user!.organizationId,
    }

    if (category) where.category = category

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from as string)
      if (to)   where.date.lte = new Date(to as string)
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where, skip, take,
        orderBy: { date: 'desc' },
      }),
      prisma.expense.count({ where }),
    ])

    return res.json(paginatedResponse(expenses, total, p, l))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب المصروفات' })
  }
}

// ── POST /api/finance/expenses ──
export async function createExpense(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح بإضافة مصروفات' })
    }

    const data = expenseSchema.parse(req.body)

    const expense = await prisma.expense.create({
      data: {
        description: data.description.trim(),
        amount: data.amount,
        category: data.category,
        date: new Date(data.date),
        receipt: data.receipt || null,
        organizationId: req.user!.organizationId,
      },
    })

    return res.status(201).json({
      message: 'تم إضافة المصروف بنجاح',
      expense,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة المصروف' })
  }
}

// ── DELETE /api/finance/expenses/:id ──
export async function deleteExpense(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح' })
    }

    const existing = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'المصروف غير موجود' })
    }

    await prisma.expense.delete({ where: { id: req.params.id } })

    return res.json({ message: 'تم حذف المصروف بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف المصروف' })
  }
}

// ── GET /api/finance/stats ──
export async function getStats(req: AuthRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId

    // آخر 6 شهور
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [
      invoices,
      expenses,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          organizationId: orgId,
          status: 'PAID',
          paidDate: { gte: sixMonthsAgo },
        },
        select: { totalAmount: true, paidDate: true },
      }),
      prisma.expense.findMany({
        where: {
          organizationId: orgId,
          date: { gte: sixMonthsAgo },
        },
        select: { amount: true, date: true, category: true },
      }),
      prisma.invoice.aggregate({
        where: { organizationId: orgId, status: 'SENT' },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { organizationId: orgId, status: 'OVERDUE' },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ])

    const totalIncome = invoices.reduce(
      (sum, i) => sum + Number(i.totalAmount),
      0
    )
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    )

    // الإيرادات حسب الشهر
    const monthlyIncome = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthName = date.toLocaleString('ar-EG', {
        month: 'long',
        year: 'numeric',
      })
      const income = invoices
        .filter(inv => {
          const d = new Date(inv.paidDate!)
          return (
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
          )
        })
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0)

      return { month: monthName, income }
    })

    // المصروفات حسب التصنيف
    const expensesByCategory = expenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
        return acc
      },
      {} as Record<string, number>
    )

    return res.json({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      pendingAmount: Number(pendingInvoices._sum.totalAmount || 0),
      pendingCount: pendingInvoices._count,
      overdueAmount: Number(overdueInvoices._sum.totalAmount || 0),
      overdueCount: overdueInvoices._count,
      monthlyIncome,
      expensesByCategory,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الإحصائيات' })
  }
}

// ── GET /api/finance/invoices/:id/pdf ──
export async function exportInvoicePDF(req: AuthRequest, res: Response) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        items: true,
        client: true,
        case: { select: { title: true, caseNumber: true } },
        organization: true,
      },
    })

    if (!invoice) {
      return res.status(404).json({ error: 'الفاتورة غير موجودة' })
    }

    generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      organization: invoice.organization,
      client: invoice.client,
      case: invoice.case || null,
      items: invoice.items.map(i => ({
        description: i.description,
        amount: Number(i.amount),
        quantity: i.quantity,
      })),
      totalAmount: Number(invoice.totalAmount),
      notes: invoice.notes,
    }, res)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في توليد الفاتورة' })
  }
}

// ── GET /api/finance/reports/pdf ──
export async function exportReportPDF(req: AuthRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [org, invoices, expenses, casesCount, clientsCount, clients] =
      await Promise.all([
        prisma.organization.findUnique({ where: { id: orgId } }),
        prisma.invoice.findMany({
          where: { organizationId: orgId, status: 'PAID',
                   paidDate: { gte: sixMonthsAgo } },
          select: { totalAmount: true },
        }),
        prisma.expense.findMany({
          where: { organizationId: orgId, date: { gte: sixMonthsAgo } },
          select: { amount: true },
        }),
        prisma.case.count({ where: { organizationId: orgId } }),
        prisma.client.count({ where: { organizationId: orgId, isActive: true } }),
        prisma.client.findMany({
          where: { organizationId: orgId, isActive: true },
          include: { _count: { select: { cases: true } } },
        }),
      ])

    const totalIncome = invoices.reduce((s, i) => s + Number(i.totalAmount), 0)
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)

    const topClients = clients
      .map(c => ({ name: c.name, cases: c._count.cases }))
      .filter(c => c.cases > 0)
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5)

    generateReportPDF({
      organization: { name: org!.name },
      period: 'آخر 6 أشهر',
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      casesCount,
      clientsCount,
      topClients,
    }, res)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في توليد التقرير' })
  }
}
