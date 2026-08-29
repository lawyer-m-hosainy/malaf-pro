import multer from 'multer'

// الملفات بتتخزن في الذاكرة مؤقتاً ثم بترفع لـ Supabase Storage
// (السيرفر مش بيحتفظ بأي ملفات على القرص لأن الـ filesystem مؤقت في بيئات
// زي Render/Railway وبيتمسح مع كل إعادة نشر)
const storage = multer.memoryStorage()

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    // مستندات
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // صور
    'image/jpeg',
    'image/png',
    'image/webp',
    // نصوص
    'text/plain',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('نوع الملف غير مسموح به. الأنواع المسموحة: PDF, Word, Excel, صور'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB حد أقصى
  },
})
