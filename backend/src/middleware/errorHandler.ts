import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error:', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => e.message).join(', ')
    return res.status(400).json({
      error: 'بيانات غير صالحة',
      details: messages,
    })
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'البيانات مكررة - يوجد سجل بنفس المعلومات',
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'السجل غير موجود' })
    }
  }

  // Default
  const status = (err as any).status || 500
  const message =
    process.env.NODE_ENV === 'production'
      ? 'حدث خطأ داخلي في الخادم'
      : err.message

  return res.status(status).json({ error: message })
}
