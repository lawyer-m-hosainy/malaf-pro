import { Router } from 'express'
import * as SessionsController from '../controllers/sessions.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET    /api/sessions           ← كل الجلسات مع فلترة بالتاريخ
// POST   /api/sessions           ← إضافة جلسة
// GET    /api/sessions/today     ← جلسات اليوم
// GET    /api/sessions/upcoming  ← الجلسات القادمة
// PUT    /api/sessions/:id       ← تعديل جلسة
// DELETE /api/sessions/:id       ← حذف جلسة

router.get('/today',      SessionsController.getToday)
router.get('/upcoming',   SessionsController.getUpcoming)
router.get('/',           SessionsController.getAll)
router.post('/',          SessionsController.create)
router.put('/:id',        SessionsController.update)
router.delete('/:id',     SessionsController.remove)

export default router
