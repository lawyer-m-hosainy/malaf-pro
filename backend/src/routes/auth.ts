import { Router } from 'express'
import * as AuthController from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

// POST /api/auth/login
router.post('/login', AuthController.login)

// POST /api/auth/refresh
router.post('/refresh', AuthController.refreshToken)

// POST /api/auth/logout
router.post('/logout', requireAuth, AuthController.logout)

// GET /api/auth/me
router.get('/me', requireAuth, AuthController.getMe)

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, AuthController.changePassword)

// PUT /api/auth/profile
router.put('/profile', requireAuth, AuthController.updateProfile)

// PUT /api/auth/organization — تحديث بيانات المكتب
router.put('/organization', requireAuth, AuthController.updateOrganization)

// POST /api/auth/team  ← إضافة عضو جديد للفريق (owner/admin فقط)
router.post('/team', requireAuth, AuthController.addTeamMember)

// GET /api/auth/team   ← عرض الفريق كله
router.get('/team', requireAuth, AuthController.getTeam)

// DELETE /api/auth/team/:id ← حذف عضو
router.delete('/team/:id', requireAuth, AuthController.removeTeamMember)

export default router
