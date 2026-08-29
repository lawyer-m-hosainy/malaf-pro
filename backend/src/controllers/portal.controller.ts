import { Response, Request } from 'express'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

// ── GET /api/portal ── قائمة الموكلين وحالة روابطهم
export async function list(req: AuthRequest, res: Response) {
  try {
    const clients = await prisma.client.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        name: true,
        phone: true,
        _count: { select: { cases: true } },
        portalAccess: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            token: true,
            isActive: true,
            expiresAt: true,
            lastViewedAt: true,
            viewCount: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const data = clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      casesCount: c._count.cases,
      access: c.portalAccess[0] || null,
    }))

    return res.json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب بيانات البوابة' })
  }
}

// ── POST /api/portal/generate ── توليد (أو إرجاع) رابط دخول للموكل
export async function generate(req: AuthRequest, res: Response) {
  try {
    const { clientId } = req.body
    if (!clientId) {
      return res.status(400).json({ error: 'الموكل مطلوب' })
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId: req.user!.organizationId },
    })
    if (!client) {
      return res.status(404).json({ error: 'الموكل غير موجود' })
    }

    const existing = await prisma.portalAccess.findFirst({
      where: { clientId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    if (existing) {
      return res.json({ data: existing })
    }

    const token = crypto.randomBytes(24).toString('hex')
    const access = await prisma.portalAccess.create({
      data: {
        token,
        clientId,
        createdById: req.user!.id,
      },
    })

    return res.status(201).json({ data: access })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في توليد الرابط' })
  }
}

// ── PATCH /api/portal/:id/toggle ── تفعيل/تعطيل رابط
export async function toggle(req: AuthRequest, res: Response) {
  try {
    const access = await prisma.portalAccess.findFirst({
      where: {
        id: req.params.id,
        client: { organizationId: req.user!.organizationId },
      },
    })
    if (!access) {
      return res.status(404).json({ error: 'الرابط غير موجود' })
    }

    const updated = await prisma.portalAccess.update({
      where: { id: access.id },
      data: { isActive: !access.isActive },
    })

    return res.json({ data: updated })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث الرابط' })
  }
}

// ── GET /api/portal/public/:token ── عرض عام للموكل (بدون تسجيل دخول) ──
export async function publicView(req: Request, res: Response) {
  try {
    const { token } = req.params

    const access = await prisma.portalAccess.findUnique({
      where: { token },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            organization: { select: { name: true, phone: true, email: true } },
            cases: {
              select: {
                id: true,
                internalId: true,
                caseNumber: true,
                title: true,
                jurisdiction: true,
                degree: true,
                status: true,
                nextSession: true,
                opponent: true,
                createdAt: true,
                caseUpdates: {
                  orderBy: { createdAt: 'desc' },
                  take: 5,
                  select: { action: true, details: true, createdAt: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!access) {
      return res.status(404).json({ error: 'الرابط غير صحيح' })
    }
    if (!access.isActive) {
      return res.status(403).json({ error: 'تم إلغاء تفعيل هذا الرابط' })
    }
    if (access.expiresAt && access.expiresAt < new Date()) {
      return res.status(403).json({ error: 'انتهت صلاحية هذا الرابط' })
    }

    // سجل المشاهدة (best-effort - مش لازم تمنع عرض البيانات لو فشل)
    prisma.portalAccess
      .update({
        where: { id: access.id },
        data: { lastViewedAt: new Date(), viewCount: { increment: 1 } },
      })
      .catch((err) => console.error('فشل تسجيل مشاهدة البوابة:', err))

    return res.json({
      data: {
        clientName: access.client.name,
        officeName: access.client.organization.name,
        officePhone: access.client.organization.phone,
        officeEmail: access.client.organization.email,
        cases: access.client.cases,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في عرض البوابة' })
  }
}
