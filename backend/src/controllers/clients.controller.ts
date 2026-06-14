import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

// ── Validation ──
const clientSchema = z.object({
  name: z.string().min(2, 'الاسم لازم يكون حرفين على الأقل'),
  nationalId: z.string()
    .regex(/^\d{14}$/, 'الرقم القومي لازم يكون 14 رقم بالظبط'),
  phone: z.string()
    .regex(/^01[0125]\d{8}$/, 'رقم الموبايل غير صحيح')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

// ── GET /api/clients ──
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const {
      search,
      page = '1',
      limit = '20',
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    // بناء شرط البحث
    const where: any = {
      organizationId: req.user!.organizationId,
      isActive: true,
    }

    if (search) {
      const q = search as string
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { nationalId: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          nationalId: true,
          phone: true,
          email: true,
          address: true,
          createdAt: true,
          _count: { select: { cases: true } },
        },
      }),
      prisma.client.count({ where }),
    ])

    return res.json({
      data: clients,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الموكلين' })
  }
}

// ── GET /api/clients/:id ──
export async function getOne(req: AuthRequest, res: Response) {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        isActive: true,
      },
      include: {
        cases: {
          select: {
            id: true,
            internalId: true,
            caseNumber: true,
            title: true,
            status: true,
            nextSession: true,
            jurisdiction: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        consultations: {
          select: {
            id: true,
            subject: true,
            date: true,
            status: true,
            fee: true,
            isPaid: true,
          },
          orderBy: { date: 'desc' },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            issueDate: true,
          },
          orderBy: { issueDate: 'desc' },
          take: 5,
        },
      },
    })

    if (!client) {
      return res.status(404).json({ error: 'الموكل غير موجود' })
    }

    return res.json(client)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}

// ── POST /api/clients ──
export async function create(req: AuthRequest, res: Response) {
  try {
    const data = clientSchema.parse(req.body)

    // تحقق من تكرار الرقم القومي في نفس المكتب
    const existing = await prisma.client.findFirst({
      where: {
        nationalId: data.nationalId,
        organizationId: req.user!.organizationId,
      },
    })

    if (existing) {
      return res.status(409).json({
        error: 'يوجد موكل مسجل بنفس الرقم القومي في هذا المكتب',
      })
    }

    const client = await prisma.client.create({
      data: {
        name: data.name.trim(),
        nationalId: data.nationalId.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
        organizationId: req.user!.organizationId,
      },
    })

    return res.status(201).json({
      message: 'تم إضافة الموكل بنجاح',
      client,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في إضافة الموكل' })
  }
}

// ── PUT /api/clients/:id ──
export async function update(req: AuthRequest, res: Response) {
  try {
    const data = clientSchema.partial().parse(req.body)

    const existing = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        isActive: true,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الموكل غير موجود' })
    }

    // لو بيغير الرقم القومي تحقق من التكرار
    if (data.nationalId && data.nationalId !== existing.nationalId) {
      const duplicate = await prisma.client.findFirst({
        where: {
          nationalId: data.nationalId,
          organizationId: req.user!.organizationId,
          id: { not: req.params.id },
        },
      })
      if (duplicate) {
        return res.status(409).json({
          error: 'الرقم القومي مستخدم بواسطة موكل آخر',
        })
      }
    }

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        name: data.name?.trim(),
        nationalId: data.nationalId?.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    })

    return res.json({
      message: 'تم تحديث بيانات الموكل بنجاح',
      client: updated,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث الموكل' })
  }
}

// ── DELETE /api/clients/:id ──
export async function remove(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح بحذف الموكلين' })
    }

    const existing = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'الموكل غير موجود' })
    }

    // Soft delete - مش بنمسح البيانات فعلاً
    await prisma.client.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })

    return res.json({ message: 'تم حذف الموكل بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف الموكل' })
  }
}
