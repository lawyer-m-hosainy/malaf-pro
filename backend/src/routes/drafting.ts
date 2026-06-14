import { Router } from 'express'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// Drafting is primarily AI-powered and handled client-side.
// This route is a placeholder for future server-side drafting features.
router.get('/templates', (_req, res) => {
  res.json({ data: [] })
})

export default router
