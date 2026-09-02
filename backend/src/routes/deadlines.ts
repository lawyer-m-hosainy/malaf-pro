import { Router } from 'express'
import * as DeadlinesController from '../controllers/deadlines.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET    /api/deadlines            ← كل المواعيد (فلترة بـ caseId/status/upcoming)
// POST   /api/deadlines            ← إضافة ميعاد حتمي
// PUT    /api/deadlines/:id        ← تعديل / تغيير حالة
// DELETE /api/deadlines/:id        ← حذف

router.get('/', DeadlinesController.getAll)
router.post('/', DeadlinesController.create)
router.put('/:id', DeadlinesController.update)
router.delete('/:id', DeadlinesController.remove)

export default router
