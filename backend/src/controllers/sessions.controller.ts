import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { SessionType } from '@prisma/client'

// ── Validation ──
const sessionSchema = z.object({
  caseId: z.string().min(1, 'القضية مطلوبة'),
  date: z.string().min(1, 'تاريخ الجلسة مطلوب'),
  time: z.string().min(1, 'وقت الجلسة مطلوب'),
  type: z.nativeEnum(SessionType).default('HEARING'),
  result: z.string().optional(),
  nextSessionDate: z.string().optional(),
  notes: z.string().optional(),
  lawyerId: z.string().optional(),
})

// ── GET /api/sessions ──
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const {
      caseId,
      from,
      to,
      page = '1',
      limit = '20',
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where: any = {
      organizationId: req.user!.organizationId,
    }

    if (req.user!.role === 'LAWYER') {
      where.lawyerId = req.user!.id
    }

    if (caseId) where.caseId = caseId

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from as string)
      if (to)   where.date.lte = new Date(to as string)
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              caseNumber: true,
              internalId: true,
              jurisdiction: true,
              client: { select: { id: true, name: true } },
            },
          },
          lawyer: { select: { id: true, name: true } },
        },
      }),
      prisma.session.count({ where }),
    ])

    return res.json({
      data: sessions,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الجلسات' })
  }
}

// ── GET /api/sessions/today ──
export async function getToday(req: AuthRequest, res: Response) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const where: any = {
      organizationId: req.user!.organizationId,
      date: { gte: today, lt: tomorrow },
    }

    if (req.user!.role === 'LAWYER') {
      where.lawyerId = req.user!.id
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { time: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            internalId: true,
            jurisdiction: true,
            degree: true,
            client: { select: { id: true, name: true } },
          },
        },
        lawyer: { select: { id: true, name: true } },
      },
    })

    return res.json({ data: sessions, total: sessions.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب جلسات اليوم' })
  }
}

// ── GET /api/sessions/upcoming ──
export async function getUpcoming(req: AuthRequest, res: Response) {
  try {
    const { days = '7' } = req.query
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const future = new Date(today)
    future.setDate(future.getDate() + parseInt(days as string))

    const where: any = {
      organizationId: req.user!.organizationId,
      date: { gte: today, lte: future },
    }

    if (req.user!.role === 'LAWYER') {
      where.lawyerId = req.user!.id
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            internalId: true,
            jurisdiction: true,
            degree: true,
            client: { select: { id: true, name: true } },
          },
        },
        lawyer: { select: { id: true, name: true } },
      },
    })

    return res.json({ data: sessions, total: sessions.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الجلسات القادمة' })
  }
}

// ── POST /api/sessions ──
export async function create(req: AuthRequest, res: Response) {
  try {
    const data = sessionSchema.parse(req.body)

    // تحقق إن القضية موجودة وتابعة للمكتب
    const caseExists = await prisma.case.findFirst({
      where: {
        id: data.caseId,
        organizationId: req.user!.organizationId,
      },
    })

    if (!caseExists) {
      return res.status(404).json({ error: 'القضية غير موجودة' })
    }

    const session = await prisma.session.create({
      data: {
        date: new Date(data.date),
        time: data.time,
        type: data.type,
        result: data.result?.trim() || null,
        nextSessionDate: data.nextSessionDate
          ? new Date(data.nextSessionDate)
          : null,
        notes: data.notes?.trim() || null,
        organizationId: req.user!.organizationId,
        caseId: data.caseId,
        lawyerId: data.lawyerId || req.user!.id,
      },
      include: {
        case: {
          select: { title: true, caseNumber: true },
        },
      },
    })

    // تحديث nextSession في القضية تلقائياً
    if (data.nextSessionDate) {
      await prisma.case.update({
        where: { id: data.caseId },
        data: { nextSession: new Date(data.nextSessionDate) },
      })
    }

    // تسجيل في سجل القضية
    await prisma.caseUpdate.create({
      data: {
        caseId: data.caseId,
        action: 'session_added',
        details: `تم إضافة جلسة بتاريخ ${data.date} بواسطة ${req.user!.name}`,
      },
    })

    return res.status(201).json({
      message: 'تم إضافة الجلسة بنجاح',
      session,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة الجلسة' })
  }
}

// ── PUT /api/sessions/:id ──
export async function update(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.session.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الجلسة غير موجودة' })
    }

    const data = sessionSchema.partial().parse(req.body)

    const updated = await prisma.session.update({
      where: { id: req.params.id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.time && { time: data.time }),
        ...(data.type && { type: data.type }),
        ...(data.result !== undefined && {
          result: data.result?.trim() || null,
        }),
        ...(data.nextSessionDate !== undefined && {
          nextSessionDate: data.nextSessionDate
            ? new Date(data.nextSessionDate)
            : null,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes?.trim() || null,
        }),
        ...(data.lawyerId && { lawyerId: data.lawyerId }),
      },
    })

    // تحديث nextSession في القضية لو اتغير
    if (data.nextSessionDate) {
      await prisma.case.update({
        where: { id: existing.caseId },
        data: { nextSession: new Date(data.nextSessionDate) },
      })
    }

    return res.json({
      message: 'تم تحديث الجلسة بنجاح',
      session: updated,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث الجلسة' })
  }
}

// ── DELETE /api/sessions/:id ──
export async function remove(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.session.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الجلسة غير موجودة' })
    }

    await prisma.session.delete({ where: { id: req.params.id } })

    return res.json({ message: 'تم حذف الجلسة بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف الجلسة' })
  }
}
