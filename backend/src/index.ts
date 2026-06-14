import app from './app'
import { env } from './config/env'
import { prisma } from './lib/prisma'

async function main() {
  // اختبر الاتصال بقاعدة البيانات
  await prisma.$connect()
  console.log('✅ تم الاتصال بقاعدة البيانات')

  app.listen(env.PORT, () => {
    console.log(`
🚀 ملف برو API يعمل على المنتفذ ${env.PORT}
🌍 البيئة: ${env.NODE_ENV}
📖 Health: http://localhost:${env.PORT}/health
    `)
  })
}

main().catch(async (e) => {
  console.error('❌ فشل تشغيل السيرفر:', e)
  await prisma.$disconnect()
  process.exit(1)
})
