import { Router } from 'express'
import * as PoaController from '../controllers/poa.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET    /api/poa            ← كل التوكيلات (فلترة بـ clientId/caseId)
// POST   /api/poa            ← إضافة توكيل
// PUT    /api/poa/:id        ← تعديل / تفعيل/تعطيل
// DELETE /api/poa/:id        ← حذف

router.get('/', PoaController.getAll)
router.post('/', PoaController.create)
router.put('/:id', PoaController.update)
router.delete('/:id', PoaController.remove)

export default router
