import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const createSchema = z.object({
  clientId: z.string().min(1, 'الموكل مطلوب'),
  number: z.string().min(1, 'رقم التوكيل مطلوب'),
  scope: z.string().min(2, 'نطاق التوكيل مطلوب'),
  issueDate: z.string().min(1, 'تاريخ التوكيل مطلوب'),
  expiryDate: z.string().optional(),
  notaryOffice: z.string().optional(),
  lawyerId: z.string().optional(),
  caseId: z.string().optional(),
  notes: z.string().optional(),
})

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// ── GET /api/poa ──
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const { clientId, caseId } = req.query
    const where: any = { organizationId: req.user!.organizationId }
    if (clientId) where.clientId = clientId as string
    if (caseId) where.caseId = caseId as string

    const items = await prisma.powerOfAttorney.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        lawyer: { select: { id: true, name: true } },
        case: { select: { id: true, title: true, internalId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ data: items })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب التوكيلات' })
  }
}

// ── POST /api/poa ──
export async function create(req: AuthRequest, res: Response) {
  try {
    const data = createSchema.parse(req.body)

    const client = await prisma.client.findFirst({
      where: { id: data.clientId, organizationId: req.user!.organizationId },
    })
    if (!client) {
      return res.status(404).json({ error: 'الموكل غير موجود' })
    }

    if (data.caseId) {
      const kase = await prisma.case.findFirst({
        where: { id: data.caseId, organizationId: req.user!.organizationId },
      })
      if (!kase) {
        return res.status(404).json({ error: 'القضية غير موجودة' })
      }
    }

    const poa = await prisma.powerOfAttorney.create({
      data: {
        number: data.number.trim(),
        scope: data.scope.trim(),
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notaryOffice: data.notaryOffice?.trim() || null,
        notes: data.notes?.trim() || null,
        clientId: data.clientId,
        lawyerId: data.lawyerId || null,
        caseId: data.caseId || null,
        organizationId: req.user!.organizationId,
      },
    })

    return res.status(201).json({ message: 'تم إضافة التوكيل بنجاح', poa })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة التوكيل' })
  }
}

// ── PUT /api/poa/:id ──
export async function update(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.powerOfAttorney.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    })
    if (!existing) {
      return res.status(404).json({ error: 'التوكيل غير موجود' })
    }

    const data = updateSchema.parse(req.body)

    const updated = await prisma.powerOfAttorney.update({
      where: { id: req.params.id },
      data: {
        ...(data.number && { number: data.number.trim() }),
        ...(data.scope && { scope: data.scope.trim() }),
        ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
        ...(data.expiryDate !== undefined && {
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        }),
        ...(data.notaryOffice !== undefined && { notaryOffice: data.notaryOffice?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
        ...(data.lawyerId !== undefined && { lawyerId: data.lawyerId || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return res.json({ message: 'تم تحديث التوكيل بنجاح', poa: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث التوكيل' })
  }
}

// ── DELETE /api/poa/:id ──
export async function remove(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.powerOfAttorney.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    })
    if (!existing) {
      return res.status(404).json({ error: 'التوكيل غير موجود' })
    }

    await prisma.powerOfAttorney.delete({ where: { id: req.params.id } })
    return res.json({ message: 'تم حذف التوكيل بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف التوكيل' })
  }
}
