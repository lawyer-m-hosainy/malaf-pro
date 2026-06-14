import { Router } from 'express'
import * as AIController from '../controllers/ai.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// POST /api/ai/draft    ← صياغة مستند قانوني
// POST /api/ai/analyze  ← تحليل نص قانوني
// POST /api/ai/search   ← بحث قانوني
// POST /api/ai/summary  ← تلخيص قضية

router.post('/draft',   AIController.draftDocument)
router.post('/analyze', AIController.analyzeText)
router.post('/search',  AIController.legalSearch)
router.post('/summary', AIController.summarizeCase)

export default router
