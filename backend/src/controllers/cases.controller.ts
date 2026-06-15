import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { CaseStatus } from '@prisma/client'
import { getPaginationParams, paginatedResponse } from '../lib/pagination'

// ── Validation ──
const caseSchema = z.object({
  internalId: z.string().min(1, 'الرقم الداخلي مطلوب'),
  caseNumber: z.string().min(1, 'رقم القضية مطلوب'),
  year: z.string().regex(/^\d{4}$/, 'السنة لازم تكون 4 أرقام'),
  title: z.string().min(3, 'عنوان القضية لازم يكون 3 أحرف على الأقل'),
  jurisdiction: z.string().min(1, 'نوع المحكمة مطلوب'),
  branch: z.string().min(1, 'الدائرة مطلوبة'),
  degree: z.string().min(1, 'الدرجة مطلوبة'),
  clientRole: z.string().min(1, 'دور الموكل مطلوب'),
  opponent: z.string().min(2, 'اسم الخصم مطلوب'),
  clientId: z.string().optional(),
  assignedLawyerId: z.string().optional(),
  nextSession: z.string().optional(),
  description: z.string().optional(),
})

const updateStatusSchema = z.object({
  status: z.nativeEnum(CaseStatus),
})

// ── GET /api/cases ──
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const { search, status, jurisdiction, page, limit } = req.query
    const { skip, take, page: p, limit: l } =
      getPaginationParams({ page, limit })

    const where: any = {
      organizationId: req.user!.organizationId,
    }

    if (req.user!.role === 'LAWYER') {
      where.assignedLawyerId = req.user!.id
    }

    if (search) {
      const q = search as string
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { caseNumber: { contains: q } },
        { internalId: { contains: q } },
        { opponent: { contains: q, mode: 'insensitive' } },
        { client: { name: { contains: q, mode: 'insensitive' } } },
      ]
    }

    if (status && status !== 'ALL') where.status = status
    if (jurisdiction && jurisdiction !== 'ALL')
      where.jurisdiction = jurisdiction

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where, skip, take,
        orderBy: [{ nextSession: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true, internalId: true, caseNumber: true, year: true,
          title: true, jurisdiction: true, branch: true, degree: true,
          clientRole: true, opponent: true, status: true,
          nextSession: true, createdAt: true,
          client: { select: { id: true, name: true, phone: true } },
          assignedLawyer: { select: { id: true, name: true } },
          _count: { select: { sessions: true, documents: true } },
        },
      }),
      prisma.case.count({ where }),
    ])

    return res.json(paginatedResponse(cases, total, p, l))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب القضايا' })
  }
}

// ── GET /api/cases/:id ──
export async function getOne(req: AuthRequest, res: Response) {
  try {
    const c = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        client: true,
        assignedLawyer: {
          select: { id: true, name: true, email: true },
        },
        sessions: {
          orderBy: { date: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            type: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            tags: true,
            createdAt: true,
            createdBy: { select: { name: true } },
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            issueDate: true,
          },
        },
        caseUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!c) {
      return res.status(404).json({ error: 'القضية غير موجودة' })
    }

    // المحامي يشوف قضاياه بس
    if (
      req.user!.role === 'LAWYER' &&
      c.assignedLawyerId !== req.user!.id
    ) {
      return res.status(403).json({ error: 'غير مصرح' })
    }

    return res.json(c)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}

// ── POST /api/cases ──
export async function create(req: AuthRequest, res: Response) {
  try {
    const data = caseSchema.parse(req.body)

    const newCase = await prisma.case.create({
      data: {
        internalId: data.internalId.trim(),
        caseNumber: data.caseNumber.trim(),
        year: data.year,
        title: data.title.trim(),
        jurisdiction: data.jurisdiction,
        branch: data.branch,
        degree: data.degree,
        clientRole: data.clientRole,
        opponent: data.opponent.trim(),
        description: data.description?.trim() || null,
        nextSession: data.nextSession
          ? new Date(data.nextSession)
          : null,
        organizationId: req.user!.organizationId,
        clientId: data.clientId || null,
        assignedLawyerId: data.assignedLawyerId || req.user!.id,
      },
    })

    // تسجيل في سجل التحديثات
    await prisma.caseUpdate.create({
      data: {
        caseId: newCase.id,
        action: 'case_created',
        details: `تم إنشاء القضية بواسطة ${req.user!.name}`,
      },
    })

    return res.status(201).json({
      message: 'تم إضافة القضية بنجاح',
      case: newCase,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة القضية' })
  }
}

// ── PUT /api/cases/:id ──
export async function update(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'القضية غير موجودة' })
    }

    const data = caseSchema.partial().parse(req.body)

    // تتبع تغيير الحالة
    const statusChanged =
      data.status !== undefined && data.status !== existing.status

    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.caseNumber && { caseNumber: data.caseNumber.trim() }),
        ...(data.year && { year: data.year }),
        ...(data.jurisdiction && { jurisdiction: data.jurisdiction }),
        ...(data.branch && { branch: data.branch }),
        ...(data.degree && { degree: data.degree }),
        ...(data.clientRole && { clientRole: data.clientRole }),
        ...(data.opponent && { opponent: data.opponent.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim() || null,
        }),
        ...(data.nextSession !== undefined && {
          nextSession: data.nextSession
            ? new Date(data.nextSession)
            : null,
        }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.assignedLawyerId && {
          assignedLawyerId: data.assignedLawyerId,
        }),
        ...(data.status && { status: data.status as CaseStatus }),
        ...(data.status === 'CLOSED' && { closedAt: new Date() }),
      },
    })

    // تسجيل التغييرات في السجل
    if (statusChanged) {
      const statusLabels: Record<string, string> = {
        ACTIVE: 'متداولة',
        RESERVED: 'محجوزة للحكم',
        WITH_EXPERTS: 'بالخبراء',
        APPEALED: 'مستأنفة',
        CLOSED: 'منتهية',
        SUSPENDED: 'موقوفة',
      }
      await prisma.caseUpdate.create({
        data: {
          caseId: req.params.id,
          action: 'status_changed',
          details: `تم تغيير حالة القضية من "${statusLabels[existing.status]}" إلى "${statusLabels[data.status as string]}" بواسطة ${req.user!.name}`,
        },
      })
    }

    return res.json({
      message: 'تم تحديث القضية بنجاح',
      case: updated,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث القضية' })
  }
}

// ── DELETE /api/cases/:id ──
export async function remove(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح بحذف القضايا' })
    }

    const existing = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'القضية غير موجودة' })
    }

    // حذف كامل مع كل المرتبط بيه
    await prisma.case.delete({ where: { id: req.params.id } })

    return res.json({ message: 'تم حذف القضية بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف القضية' })
  }
}

// ── GET /api/cases/:id/history ──
export async function getHistory(req: AuthRequest, res: Response) {
  try {
    const history = await prisma.caseUpdate.findMany({
      where: { caseId: req.params.id },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ data: history })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}
