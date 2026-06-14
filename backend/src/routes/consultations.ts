import { Router } from 'express'
import * as ConsultationsController from
  '../controllers/consultations.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/',    ConsultationsController.getAll)
router.post('/',   ConsultationsController.create)
router.put('/:id', ConsultationsController.update)
router.delete('/:id', ConsultationsController.remove)

export default router
