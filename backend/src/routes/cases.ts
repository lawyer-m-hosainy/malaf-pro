import { Router } from 'express'
import * as CasesController from '../controllers/cases.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET    /api/cases             ← كل القضايا مع فلترة
// POST   /api/cases             ← إضافة قضية
// GET    /api/cases/:id         ← تفاصيل قضية كاملة
// PUT    /api/cases/:id         ← تعديل قضية
// DELETE /api/cases/:id         ← حذف (owner/admin)
// GET    /api/cases/:id/history ← سجل التحديثات

router.get('/',              CasesController.getAll)
router.post('/',             CasesController.create)
router.get('/:id',           CasesController.getOne)
router.put('/:id',           CasesController.update)
router.delete('/:id',        CasesController.remove)
router.get('/:id/history',   CasesController.getHistory)

export default router
