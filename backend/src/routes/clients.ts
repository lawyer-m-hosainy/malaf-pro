import { Router } from 'express'
import * as ClientsController from '../controllers/clients.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// GET    /api/clients          ← كل الموكلين مع بحث
// POST   /api/clients          ← إضافة موكل
// GET    /api/clients/:id      ← تفاصيل موكل + قضاياه
// PUT    /api/clients/:id      ← تعديل موكل
// DELETE /api/clients/:id      ← حذف موكل (owner/admin)

router.get('/',     ClientsController.getAll)
router.post('/',    ClientsController.create)
router.get('/:id',  ClientsController.getOne)
router.put('/:id',  ClientsController.update)
router.delete('/:id', ClientsController.remove)

export default router
