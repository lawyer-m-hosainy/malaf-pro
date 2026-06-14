import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import authRouter from './routes/auth'
import clientsRouter from './routes/clients'
import casesRouter from './routes/cases'
import sessionsRouter from './routes/sessions'
import consultationsRouter from './routes/consultations'
import financeRouter from './routes/finance'
import { errorHandler } from './middleware/errorHandler'
const app = express()

// Security headers
app.use(helmet())

// CORS - السماح للـ frontend فقط
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))

// Rate limiting - الحماية من الهجمات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: { error: 'طلبات كثيرة جداً، حاول بعد قليل' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Rate limit أشد على الـ auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'محاولات تسجيل دخول كثيرة، انتظر 15 دقيقة' },
})
app.use('/api/auth/login', authLimiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    app: 'ملف برو API',
    version: '1.0.0',
    time: new Date().toISOString(),
  })
})

// Routes هتتضاف هنا في Prompts الجاية
app.use('/api/auth', authRouter)
app.use('/api/clients', clientsRouter)
app.use('/api/cases', casesRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/consultations', consultationsRouter)
app.use('/api/finance', financeRouter)
// app.use('/api/clients', clientsRouter)
// ...

// 404 handler
app.use('*', (_, res) => {
  res.status(404).json({ error: 'المسار غير موجود' })
})

app.use(errorHandler)

export default app
