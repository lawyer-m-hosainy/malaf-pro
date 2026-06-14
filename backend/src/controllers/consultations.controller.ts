import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import {
  ConsultationType,
  ConsultationStatus,
} from '@prisma/client'

const consultationSchema = z.object({
  subject: z.string().min(3, 'موضوع الاستشارة مطلوب'),
  type: z.nativeEnum(ConsultationType).default('IN_PERSON'),
  status: z.nativeEnum(ConsultationStatus).default('SCHEDULED'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  fee: z.number().positive('الأتعاب لازم تكون أكبر من صفر').optional(),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
  clientId: z.string().optional(),
  lawyerId: z.string().optional(),
})

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const { status, from, to, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where: any = {
      organizationId: req.user!.organizationId,
    }

    if (req.user!.role === 'LAWYER') {
      where.lawyerId = req.user!.id
    }

    if (status) where.status = status as ConsultationStatus

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from as string)
      if (to)   where.date.lte = new Date(to as string)
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          lawyer: { select: { id: true, name: true } },
        },
      }),
      prisma.consultation.count({ where }),
    ])

    return res.json({
      data: consultations,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الاستشارات' })
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const data = consultationSchema.parse(req.body)

    const consultation = await prisma.consultation.create({
      data: {
        subject: data.subject.trim(),
        type: data.type,
        status: data.status,
        date: new Date(data.date),
        fee: data.fee || null,
        isPaid: data.isPaid,
        notes: data.notes?.trim() || null,
        organizationId: req.user!.organizationId,
        clientId: data.clientId || null,
        lawyerId: data.lawyerId || req.user!.id,
      },
      include: {
        client: { select: { id: true, name: true } },
        lawyer: { select: { id: true, name: true } },
      },
    })

    return res.status(201).json({
      message: 'تم إضافة الاستشارة بنجاح',
      consultation,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة الاستشارة' })
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.consultation.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الاستشارة غير موجودة' })
    }

    const data = consultationSchema.partial().parse(req.body)

    const updated = await prisma.consultation.update({
      where: { id: req.params.id },
      data: {
        ...(data.subject && { subject: data.subject.trim() }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.fee !== undefined && { fee: data.fee || null }),
        ...(data.isPaid !== undefined && { isPaid: data.isPaid }),
        ...(data.notes !== undefined && {
          notes: data.notes?.trim() || null,
        }),
        ...(data.clientId !== undefined && {
          clientId: data.clientId || null,
        }),
        ...(data.lawyerId && { lawyerId: data.lawyerId }),
      },
    })

    return res.json({
      message: 'تم تحديث الاستشارة بنجاح',
      consultation: updated,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث الاستشارة' })
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.consultation.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الاستشارة غير موجودة' })
    }

    await prisma.consultation.delete({ where: { id: req.params.id } })

    return res.json({ message: 'تم حذف الاستشارة بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف الاستشارة' })
  }
}
