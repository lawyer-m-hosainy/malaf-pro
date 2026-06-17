import path from 'path'

// حمّل خط Cairo أو Amiri من Google Fonts وحطه هنا:
// backend/assets/fonts/Cairo-Regular.ttf
// backend/assets/fonts/Cairo-Bold.ttf

export const FONTS = {
  regular: path.join(process.cwd(), 'backend', 'assets', 'fonts', 'Cairo-Regular.ttf'),
  bold: path.join(process.cwd(), 'backend', 'assets', 'fonts', 'Cairo-Bold.ttf'),
}

// دالة لعكس النص العربي للعرض الصحيح في PDFKit
// (PDFKit مبيدعمش RTL تلقائي)
// ملاحظة: هذي نسخة مبسطة — للأرقام والـ LTR داخل النص ممكن تحتاج معالجة أضخم
export function reshapeArabic(text: string): string {
  return text.split(' ').reverse().join(' ')
}
