import { Router } from 'express'
import * as PortalController from '../controllers/portal.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/portal/public/:token ← عرض عام للموكل (بدون تسجيل دخول) - لازم يتسجل قبل requireAuth
router.get('/public/:token', PortalController.publicView)

router.use(requireAuth)

// GET   /api/portal              ← قائمة الموكلين وحالة روابطهم
// POST  /api/portal/generate     ← توليد رابط دخول لموكل
// PATCH /api/portal/:id/toggle   ← تفعيل/تعطيل رابط

router.get('/', PortalController.list)
router.post('/generate', PortalController.generate)
router.patch('/:id/toggle', PortalController.toggle)

export default router
