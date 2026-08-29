import path from 'path'

// خط Cairo (Google Fonts, رخصة OFL) موجود في:
// backend/assets/fonts/Cairo-Regular.ttf
// backend/assets/fonts/Cairo-Bold.ttf
// المسار مبني على __dirname مش process.cwd() عشان يشتغل صح
// بغض النظر عن المجلد اللي بيتشغل منه السيرفر (dev أو production)
//
// ملاحظة: PDFKit (عن طريق fontkit) بيعمل Arabic text shaping و bidi
// reordering صحيح تلقائياً طالما الخط بيدعم عربي - مفيش داعي لأي معالجة
// يدوية للنص، فقط مرر النص العربي الأصلي زي ما هو مع { align: 'right' }.

export const FONTS = {
  regular: path.join(__dirname, '../../assets/fonts/Cairo-Regular.ttf'),
  bold: path.join(__dirname, '../../assets/fonts/Cairo-Bold.ttf'),
}
