# ملف برو (Malaf Pro)

منصة SaaS لإدارة مكاتب المحاماة: القضايا، الموكلين، الجلسات، الفواتير، المستندات، وبوابة متابعة للموكلين.

- **الفرونت إند**: React + Vite + TypeScript + Tailwind
- **الباك إند**: Express + TypeScript + Prisma + PostgreSQL
- **التخزين**: Supabase Storage للمستندات المرفوعة

## التشغيل محلياً

### المتطلبات
- Node.js 18+
- قاعدة بيانات PostgreSQL (محلية أو Supabase)
- مشروع Supabase (لتخزين الملفات المرفوعة)

### 1. الباك إند

```bash
cd backend
npm install
cp .env.example .env   # املأ القيم الحقيقية
npm run db:push        # يزامن الـ schema مع قاعدة البيانات
npm run db:seed        # (اختياري) بيانات تجريبية
npm run dev
```

المتغيرات المطلوبة في `backend/.env`: `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY` — بدونها السيرفر مش هيشتغل أصلاً (تحقق عند الإقلاع).

### 2. الفرونت إند

```bash
npm install
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
npm run dev
```

الفرونت إند بيتوقع الباك إند شغال على `http://localhost:3001` (أو حسب `VITE_API_URL`).

## الاختبارات

```bash
cd backend
npm test
```

محتاج قاعدة بيانات PostgreSQL شغالة و`DATABASE_URL`/`DIRECT_URL`/`JWT_SECRET`/
`SUPABASE_URL`/`SUPABASE_SERVICE_KEY` متظبطة في البيئة (شوف `.github/workflows/ci.yml`
لمثال كامل).

## البناء للإنتاج

```bash
npm run build          # من الروت - بيبني الفرونت إند
cd backend && npx prisma generate
```

السيرفر (`backend/src/index.ts`) بيخدم الفرونت المبني من `dist/` تلقائياً، فمحتاج
سيرفس واحدة بس في الإنتاج (شوف `render.yaml` أو `railway.json`).

## البنية

```
src/                  # الفرونت إند (React)
backend/
  src/
    controllers/      # منطق الـ API
    routes/           # تعريف الـ endpoints
    lib/               # Prisma client, pagination, Supabase storage...
    services/          # توليد PDF
    middleware/         # auth, upload, error handling
  prisma/schema.prisma # الـ schema الكامل لقاعدة البيانات
  tests/               # اختبارات API (vitest + supertest)
```
