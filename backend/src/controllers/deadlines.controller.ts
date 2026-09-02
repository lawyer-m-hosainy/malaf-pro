import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const createSchema = z.object({
  caseId: z.string().min(1, 'القضية مطلوبة'),
  title: z.string().min(2, 'عنوان الميعاد مطلوب'),
  triggerDate: z.string().min(1, 'تاريخ بداية سريان الميعاد مطلوب'),
  deadlineDate: z.string().min(1, 'تاريخ انتهاء الميعاد مطلوب'),
  notes: z.string().optional(),
})

const updateSchema = createSchema.partial().extend({
  status: z.enum(['PENDING', 'COMPLETED', 'MISSED']).optional(),
})

// ── GET /api/deadlines ──
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const { caseId, status, upcoming } = req.query
    const where: any = { organizationId: req.user!.organizationId }

    if (caseId) where.caseId = caseId as string
    if (status) where.status = status as string

    if (upcoming === 'true') {
      const in14Days = new Date()
      in14Days.setDate(in14Days.getDate() + 14)
      where.status = 'PENDING'
      where.deadlineDate = { lte: in14Days }
    }

    const deadlines = await prisma.criticalDeadline.findMany({
      where,
      include: {
        case: { select: { id: true, title: true, internalId: true, caseNumber: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { deadlineDate: 'asc' },
    })

    return res.json({ data: deadlines })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب المواعيد الحتمية' })
  }
}

// ── POST /api/deadlines ──
export async function create(req: AuthRequest, res: Response) {
  try {
    const data = createSchema.parse(req.body)

    const kase = await prisma.case.findFirst({
      where: { id: data.caseId, organizationId: req.user!.organizationId },
    })
    if (!kase) {
      return res.status(404).json({ error: 'القضية غير موجودة' })
    }

    const deadline = await prisma.criticalDeadline.create({
      data: {
        title: data.title.trim(),
        triggerDate: new Date(data.triggerDate),
        deadlineDate: new Date(data.deadlineDate),
        notes: data.notes?.trim() || null,
        caseId: data.caseId,
        organizationId: req.user!.organizationId,
        createdById: req.user!.id,
      },
    })

    await prisma.caseUpdate.create({
      data: {
        caseId: data.caseId,
        action: 'deadline_added',
        details: `تم إضافة ميعاد حتمي "${data.title}" بتاريخ ${new Date(data.deadlineDate).toLocaleDateString('ar-EG')} بواسطة ${req.user!.name}`,
      },
    })

    return res.status(201).json({ message: 'تم إضافة الميعاد بنجاح', deadline })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة الميعاد' })
  }
}

// ── PUT /api/deadlines/:id ──
export async function update(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.criticalDeadline.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    })
    if (!existing) {
      return res.status(404).json({ error: 'الميعاد غير موجود' })
    }

    const data = updateSchema.parse(req.body)

    const updated = await prisma.criticalDeadline.update({
      where: { id: req.params.id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.triggerDate && { triggerDate: new Date(data.triggerDate) }),
        ...(data.deadlineDate && { deadlineDate: new Date(data.deadlineDate) }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
        ...(data.status && {
          status: data.status,
          completedAt: data.status === 'COMPLETED' ? new Date() : existing.completedAt,
        }),
      },
    })

    if (data.status && data.status !== existing.status) {
      const statusLabels: Record<string, string> = {
        PENDING: 'قيد الانتظار',
        COMPLETED: 'تم اتخاذ الإجراء',
        MISSED: 'فات الميعاد',
      }
      await prisma.caseUpdate.create({
        data: {
          caseId: existing.caseId,
          action: 'deadline_status_changed',
          details: `تم تحديث حالة ميعاد "${existing.title}" إلى "${statusLabels[data.status]}" بواسطة ${req.user!.name}`,
        },
      })
    }

    return res.json({ message: 'تم تحديث الميعاد بنجاح', deadline: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث الميعاد' })
  }
}

// ── DELETE /api/deadlines/:id ──
export async function remove(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.criticalDeadline.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    })
    if (!existing) {
      return res.status(404).json({ error: 'الميعاد غير موجود' })
    }

    await prisma.criticalDeadline.delete({ where: { id: req.params.id } })
    return res.json({ message: 'تم حذف الميعاد بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف الميعاد' })
  }
}
