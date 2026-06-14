import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    organizationId: string
    name: string
  }
}

// ── التحقق من الـ JWT ──
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: string
      email: string
      role: string
      organizationId: string
    }

    // تحقق إن المستخدم لا يزال موجود ونشط
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: 'الحساب غير نشط أو غير موجود' })
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' })
    }
    return res.status(401).json({ error: 'رمز التحقق غير صالح' })
  }
}

// ── التحقق من الدور ──
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح' })
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'ليس لديك صلاحية للقيام بهذا الإجراء' })
    }
    next()
  }
}

// ── Helper: توليد الـ Tokens ──
export function generateTokens(payload: {
  id: string
  email: string
  role: string
  organizationId: string
}) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  })

  const refreshToken = jwt.sign(
    { id: payload.id },
    env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  )

  return { accessToken, refreshToken }
}
