import { Router } from 'express'
import * as DocumentsController from '../controllers/documents.controller'
import { requireAuth } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()
router.use(requireAuth)

// GET    /api/documents            ← كل المستندات مع فلترة
// POST   /api/documents/upload     ← رفع ملف
// GET    /api/documents/:id        ← تفاصيل مستند
// GET    /api/documents/:id/download ← تحميل الملف
// PUT    /api/documents/:id        ← تعديل بيانات المستند
// DELETE /api/documents/:id        ← حذف مستند

router.get('/',              DocumentsController.getAll)
router.post('/upload',       upload.single('file'), DocumentsController.uploadFile)
router.get('/:id',           DocumentsController.getOne)
router.get('/:id/download',  DocumentsController.download)
router.put('/:id',           DocumentsController.update)
router.delete('/:id',        DocumentsController.remove)

export default router
