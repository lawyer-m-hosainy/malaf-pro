import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import authRouter from './routes/auth'
import clientsRouter from './routes/clients'
import casesRouter from './routes/cases'
import sessionsRouter from './routes/sessions'
import consultationsRouter from './routes/consultations'
import financeRouter from './routes/finance'
import dashboardRouter from './routes/dashboard'
import aiRouter from './routes/ai'
import documentsRouter from './routes/documents'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // عشان الفرونت يشتغل صح
}))

// CORS - السماح للـ frontend
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

// خدمة الملفات الثابتة (المستندات المرفوعة)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    app: 'ملف برو API',
    version: '1.0.0',
    time: new Date().toISOString(),
  })
})

// ══════════════════════════════════════
// API Routes
// ══════════════════════════════════════
app.use('/api/auth', authRouter)
app.use('/api/clients', clientsRouter)
app.use('/api/cases', casesRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/consultations', consultationsRouter)
app.use('/api/finance', financeRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/ai', aiRouter)

// ══════════════════════════════════════
// Frontend - خدمة الفرونت إند من نفس السيرفر
// ══════════════════════════════════════
const frontendPath = path.join(__dirname, '../../dist')

if (fs.existsSync(frontendPath)) {
  // خدمة الملفات الثابتة (CSS, JS, Images)
  app.use(express.static(frontendPath))

  // SPA fallback - أي مسار مش API يرجع الفرونت
  app.get('*', (req, res) => {
    // لو المسار بيبدأ بـ /api يرجع 404
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'المسار غير موجود' })
    }
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
} else {
  // لو الفرونت مش موجود (Development)
  app.use('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({ error: 'المسار غير موجود' })
    }
    res.status(200).json({
      message: 'ملف برو API يعمل ✅',
      hint: 'الفرونت إند مش موجود. شغله بـ npm run dev من المجلد الرئيسي',
    })
  })
}

// Global error handler
app.use(errorHandler)

export default app

