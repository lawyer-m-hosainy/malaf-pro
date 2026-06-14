import { Router } from 'express'
import * as DashboardController from '../controllers/dashboard.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET /api/dashboard/stats     ← الإحصائيات الرئيسية
// GET /api/dashboard/today     ← ملخص اليوم
// GET /api/dashboard/alerts    ← تنبيهات وإشعارات

router.get('/stats',   DashboardController.getStats)
router.get('/today',   DashboardController.getToday)
router.get('/alerts',  DashboardController.getAlerts)

export default router
