import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

// ── GET /api/dashboard/stats ──
export async function getStats(req: AuthRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    )
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalClients,
      newClientsThisMonth,
      totalCases,
      activeCases,
      closedCases,
      totalSessions,
      invoiceStats,
      lastMonthInvoiceStats,
      casesByStatus,
      casesByJurisdiction,
      upcomingSessions,
    ] = await Promise.all([
      // إجمالي الموكلين
      prisma.client.count({
        where: { organizationId: orgId, isActive: true },
      }),

      // موكلين جدد الشهر ده
      prisma.client.count({
        where: {
          organizationId: orgId,
          isActive: true,
          createdAt: { gte: startOfMonth },
        },
      }),

      // إجمالي القضايا
      prisma.case.count({
        where: { organizationId: orgId },
      }),

      // القضايا المتداولة
      prisma.case.count({
        where: {
          organizationId: orgId,
          status: {
            in: ['ACTIVE', 'RESERVED', 'WITH_EXPERTS', 'APPEALED'],
          },
        },
      }),

      // القضايا المنتهية
      prisma.case.count({
        where: { organizationId: orgId, status: 'CLOSED' },
      }),

      // إجمالي الجلسات
      prisma.session.count({
        where: { organizationId: orgId },
      }),

      // إحصائيات الفواتير الشهر الحالي
      prisma.invoice.aggregate({
        where: {
          organizationId: orgId,
          status: 'PAID',
          paidDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // إحصائيات الفواتير الشهر الماضي للمقارنة
      prisma.invoice.aggregate({
        where: {
          organizationId: orgId,
          status: 'PAID',
          paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalAmount: true },
      }),

      // توزيع القضايا حسب الحالة
      prisma.case.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: { status: true },
      }),

      // توزيع القضايا حسب نوع المحكمة
      prisma.case.groupBy({
        by: ['jurisdiction'],
        where: { organizationId: orgId },
        _count: { jurisdiction: true },
        orderBy: { _count: { jurisdiction: 'desc' } },
        take: 5,
      }),

      // أقرب 5 جلسات قادمة
      prisma.session.findMany({
        where: {
          organizationId: orgId,
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        take: 5,
        include: {
          case: {
            select: {
              id: true,
              title: true,
              caseNumber: true,
              internalId: true,
              jurisdiction: true,
              client: { select: { name: true } },
            },
          },
          lawyer: { select: { name: true } },
        },
      }),
    ])

    // حساب نسبة التغيير في الإيرادات
    const thisMonthIncome = Number(invoiceStats._sum.totalAmount || 0)
    const lastMonthIncome = Number(
      lastMonthInvoiceStats._sum.totalAmount || 0
    )
    const incomeGrowth =
      lastMonthIncome > 0
        ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)
            .toFixed(1)
        : null

    // ترجمة حالات القضايا للعربي
    const statusLabels: Record<string, string> = {
      ACTIVE:       'متداولة',
      RESERVED:     'محجوزة للحكم',
      WITH_EXPERTS: 'بالخبراء',
      APPEALED:     'مستأنفة',
      CLOSED:       'منتهية',
      SUSPENDED:    'موقوفة',
    }

    return res.json({
      // أرقام رئيسية
      totalClients,
      newClientsThisMonth,
      totalCases,
      activeCases,
      closedCases,
      totalSessions,

      // مالية
      thisMonthIncome,
      lastMonthIncome,
      incomeGrowth,
      paidInvoicesCount: invoiceStats._count,

      // رسوم بيانية
      casesByStatus: casesByStatus.map(s => ({
        name: statusLabels[s.status] || s.status,
        value: s._count.status,
      })),
      casesByJurisdiction: casesByJurisdiction.map(j => ({
        name: j.jurisdiction,
        value: j._count.jurisdiction,
      })),

      // جلسات قادمة
      upcomingSessions,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب الإحصائيات' })
  }
}

// ── GET /api/dashboard/today ──
export async function getToday(req: AuthRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const where: any = {
      organizationId: orgId,
      date: { gte: today, lt: tomorrow },
    }

    if (req.user!.role === 'LAWYER') {
      where.lawyerId = req.user!.id
    }

    const [todaySessions, todayConsultations, overdueInvoices] =
      await Promise.all([
        prisma.session.findMany({
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
                client: { select: { name: true, phone: true } },
              },
            },
            lawyer: { select: { name: true } },
          },
        }),

        prisma.consultation.findMany({
          where: {
            organizationId: orgId,
            date: { gte: today, lt: tomorrow },
            status: 'SCHEDULED',
          },
          include: {
            client: { select: { name: true, phone: true } },
            lawyer: { select: { name: true } },
          },
        }),

        prisma.invoice.findMany({
          where: {
            organizationId: orgId,
            status: 'OVERDUE',
          },
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            dueDate: true,
            client: { select: { name: true } },
          },
          take: 5,
        }),
      ])

    return res.json({
      date: today.toISOString().split('T')[0],
      sessionsCount: todaySessions.length,
      consultationsCount: todayConsultations.length,
      overdueInvoicesCount: overdueInvoices.length,
      sessions: todaySessions,
      consultations: todayConsultations,
      overdueInvoices,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب بيانات اليوم' })
  }
}

// ── GET /api/dashboard/alerts ──
export async function getAlerts(req: AuthRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const in7Days = new Date(today)
    in7Days.setDate(in7Days.getDate() + 7)

    const alerts: {
      type: string
      severity: 'high' | 'medium' | 'low'
      title: string
      message: string
      caseId?: string
      link?: string
    }[] = []

    // جلسات النهارده
    const todaySessionsCount = await prisma.session.count({
      where: {
        organizationId: orgId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
        ...(req.user!.role === 'LAWYER'
          ? { lawyerId: req.user!.id }
          : {}),
      },
    })

    if (todaySessionsCount > 0) {
      alerts.push({
        type: 'session_today',
        severity: 'high',
        title: 'جلسات اليوم',
        message: `عندك ${todaySessionsCount} جلسة النهارده`,
        link: '/dashboard/sessions',
      })
    }

    // جلسات خلال 7 أيام
    const upcomingCases = await prisma.case.findMany({
      where: {
        organizationId: orgId,
        nextSession: { gte: today, lte: in7Days },
        status: { in: ['ACTIVE', 'RESERVED', 'WITH_EXPERTS'] },
        ...(req.user!.role === 'LAWYER'
          ? { assignedLawyerId: req.user!.id }
          : {}),
      },
      select: {
        id: true,
        title: true,
        nextSession: true,
        caseNumber: true,
      },
      orderBy: { nextSession: 'asc' },
      take: 10,
    })

    upcomingCases.forEach(c => {
      const diffDays = Math.ceil(
        (new Date(c.nextSession!).getTime() - today.getTime()) /
          86400000
      )
      const dayLabel =
        diffDays === 0
          ? 'اليوم'
          : diffDays === 1
          ? 'غداً'
          : `بعد ${diffDays} أيام`

      alerts.push({
        type: 'upcoming_session',
        severity: diffDays <= 1 ? 'high' : 'medium',
        title: 'جلسة قادمة',
        message: `قضية "${c.title}" (${c.caseNumber}) - ${dayLabel}`,
        caseId: c.id,
        link: `/dashboard/cases/${c.id}`,
      })
    })

    // فواتير متأخرة
    const overdueCount = await prisma.invoice.count({
      where: { organizationId: orgId, status: 'OVERDUE' },
    })

    if (overdueCount > 0) {
      alerts.push({
        type: 'overdue_invoices',
        severity: 'high',
        title: 'فواتير متأخرة',
        message: `يوجد ${overdueCount} فاتورة متأخرة تحتاج متابعة`,
        link: '/dashboard/finance',
      })
    }

    // فواتير مرسلة بدون دفع أكتر من 30 يوم
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const oldPendingCount = await prisma.invoice.count({
      where: {
        organizationId: orgId,
        status: 'SENT',
        issueDate: { lte: thirtyDaysAgo },
      },
    })

    if (oldPendingCount > 0) {
      alerts.push({
        type: 'pending_invoices',
        severity: 'medium',
        title: 'أتعاب مستحقة',
        message: `${oldPendingCount} فاتورة مرسلة منذ أكثر من 30 يوم`,
        link: '/dashboard/finance',
      })
    }

    // ترتيب: high → medium → low
    alerts.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.severity] - order[b.severity]
    })

    return res.json({ data: alerts, total: alerts.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب التنبيهات' })
  }
}
