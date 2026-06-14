import { Response } from 'express'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { env } from '../config/env'

// تهيئة Gemini
function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY غير مضبوط')
  }
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

// ── Schemas ──
const draftSchema = z.object({
  type: z.enum([
    'contract',        // عقد
    'power_of_attorney', // توكيل
    'legal_notice',    // إنذار
    'memorandum',      // مذكرة دفاع
    'complaint',       // شكوى
    'appeal',          // استئناف
    'other',           // أخرى
  ]),
  details: z.string().min(10, 'تفاصيل المستند مطلوبة'),
  caseId: z.string().optional(),
  language: z.enum(['ar', 'en']).default('ar'),
})

const analyzeSchema = z.object({
  text: z.string().min(10, 'النص مطلوب'),
  task: z.enum([
    'review',       // مراجعة قانونية
    'risks',        // تحديد المخاطر
    'summary',      // تلخيص
    'translation',  // ترجمة قانونية
  ]),
})

const searchSchema = z.object({
  query: z.string().min(3, 'استعلام البحث مطلوب'),
  jurisdiction: z.string().optional(),
})

const summarySchema = z.object({
  caseId: z.string().min(1, 'القضية مطلوبة'),
})

// أنواع المستندات بالعربي
const documentTypeLabels: Record<string, string> = {
  contract:          'عقد قانوني',
  power_of_attorney: 'توكيل رسمي',
  legal_notice:      'إنذار قانوني',
  memorandum:        'مذكرة دفاع',
  complaint:         'شكوى',
  appeal:            'مذكرة استئناف',
  other:             'مستند قانوني',
}

// ── POST /api/ai/draft ──
export async function draftDocument(req: AuthRequest, res: Response) {
  try {
    const data = draftSchema.parse(req.body)

    // جلب بيانات القضية لو موجودة
    let caseContext = ''
    if (data.caseId) {
      const c = await prisma.case.findFirst({
        where: {
          id: data.caseId,
          organizationId: req.user!.organizationId,
        },
        include: {
          client: { select: { name: true, nationalId: true } },
        },
      })

      if (c) {
        caseContext = `
معلومات القضية:
- رقم القضية: ${c.caseNumber} لسنة ${c.year}
- الرقم الداخلي: ${c.internalId}
- عنوان القضية: ${c.title}
- المحكمة: ${c.jurisdiction} - ${c.branch} - ${c.degree}
- الموكل: ${c.client?.name || 'غير محدد'}
- الرقم القومي للموكل: ${c.client?.nationalId || 'غير محدد'}
- دور الموكل: ${c.clientRole}
- الخصم: ${c.opponent}
`
      }
    }

    const orgName = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: { name: true },
    })

    const prompt = `
أنت محامٍ خبير في القانون المصري متخصص في صياغة المستندات القانونية.
اكتب ${documentTypeLabels[data.type]} احترافياً باللغة العربية الفصحى
وفقاً للقانون المصري والأعراف القانونية المعمول بها في مصر.

${caseContext}

تعليمات صياغة ${documentTypeLabels[data.type]}:
${data.details}

اسم المكتب القانوني: ${orgName?.name || 'المكتب القانوني'}
المحامي المسؤول: ${req.user!.name}
التاريخ: ${new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}

متطلبات الصياغة:
1. استخدم اللغة القانونية الرسمية المصرية
2. اتبع الهيكل القانوني الصحيح للمستند
3. اذكر المواد القانونية ذات الصلة من القانون المصري
4. أضف جميع البيانات والصياغات القانونية اللازمة
5. اجعل المستند جاهزاً للاستخدام الرسمي
6. أضف مساحات للتوقيع والتاريخ في النهاية

اكتب المستند كاملاً الآن:
`

    const model = getGeminiClient()
    const result = await model.generateContent(prompt)
    const content = result.response.text()

    // حفظ المستند تلقائياً
    const doc = await prisma.document.create({
      data: {
        title: `${documentTypeLabels[data.type]} - ${new Date().toLocaleDateString('ar-EG')}`,
        type: data.type,
        content,
        caseId: data.caseId || null,
        organizationId: req.user!.organizationId,
        createdById: req.user!.id,
        tags: ['AI', documentTypeLabels[data.type]],
      },
    })

    return res.json({
      content,
      documentId: doc.id,
      message: 'تم صياغة المستند وحفظه بنجاح',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('AI Error:', err)
    return res.status(500).json({
      error: 'حدث خطأ في صياغة المستند، حاول مرة أخرى',
    })
  }
}

// ── POST /api/ai/analyze ──
export async function analyzeText(req: AuthRequest, res: Response) {
  try {
    const data = analyzeSchema.parse(req.body)

    const taskPrompts: Record<string, string> = {
      review: `
أنت محامٍ خبير في القانون المصري.
راجع النص القانوني التالي وقدم:
1. ملخص موجز للنص
2. النقاط القانونية الرئيسية
3. أي ثغرات أو مشكلات قانونية
4. التوصيات والاقتراحات للتحسين
5. مدى التوافق مع القانون المصري

النص:
${data.text}
`,
      risks: `
أنت محامٍ خبير في القانون المصري متخصص في تحليل المخاطر.
حلل النص التالي وحدد:
1. المخاطر القانونية عالية الخطورة (باللون الأحمر)
2. المخاطر المتوسطة (باللون الأصفر)
3. المخاطر المنخفضة (باللون الأخضر)
4. كيفية تجنب كل خطر أو التخفيف منه
5. التوصيات القانونية العاجلة

النص:
${data.text}
`,
      summary: `
أنت محامٍ خبير. لخّص النص القانوني التالي في:
1. ملخص تنفيذي (جملتان فقط)
2. الأطراف المعنية
3. الالتزامات الرئيسية لكل طرف
4. المواعيد والمدد الزمنية المهمة
5. النقاط التي تحتاج انتباهاً خاصاً

النص:
${data.text}
`,
      translation: `
أنت مترجم قانوني محترف متخصص في القانون المصري.
ترجم النص التالي إلى العربية القانونية الفصحى مع:
1. الحفاظ على المعنى القانوني الدقيق
2. استخدام المصطلحات القانونية المصرية الصحيحة
3. ذكر المكافئ القانوني المصري لكل مصطلح أجنبي

النص:
${data.text}
`,
    }

    const model = getGeminiClient()
    const result = await model.generateContent(taskPrompts[data.task])
    const analysis = result.response.text()

    return res.json({ analysis })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('AI Error:', err)
    return res
      .status(500)
      .json({ error: 'حدث خطأ في تحليل النص، حاول مرة أخرى' })
  }
}

// ── POST /api/ai/search ──
export async function legalSearch(req: AuthRequest, res: Response) {
  try {
    const data = searchSchema.parse(req.body)

    const prompt = `
أنت محامٍ خبير في القانون المصري ومرجع قانوني موثوق.
أجب على الاستفسار القانوني التالي بشكل شامل ودقيق:

الاستفسار: ${data.query}
${data.jurisdiction ? `نطاق القضاء: ${data.jurisdiction}` : ''}

قدم إجابتك بهذا الهيكل:
1. الإجابة المباشرة
2. الأساس القانوني (المواد والقوانين المصرية المنطبقة)
3. أحكام محكمة النقض ذات الصلة (إن وجدت)
4. الإجراءات العملية المتبعة
5. ملاحظات وتحذيرات مهمة
6. المصادر القانونية للمراجعة

تنبيه: قدم المعلومات كمرجع قانوني عام، وأوصِ بالرجوع
لمحامٍ متخصص للقضايا الفردية.
`

    const model = getGeminiClient()
    const result = await model.generateContent(prompt)
    const answer = result.response.text()

    return res.json({ answer, query: data.query })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('AI Error:', err)
    return res
      .status(500)
      .json({ error: 'حدث خطأ في البحث القانوني، حاول مرة أخرى' })
  }
}

// ── POST /api/ai/summary ──
export async function summarizeCase(req: AuthRequest, res: Response) {
  try {
    const { caseId } = summarySchema.parse(req.body)

    const c = await prisma.case.findFirst({
      where: { id: caseId, organizationId: req.user!.organizationId },
      include: {
        client: { select: { name: true } },
        assignedLawyer: { select: { name: true } },
        sessions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        caseUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!c) {
      return res.status(404).json({ error: 'القضية غير موجودة' })
    }

    const sessionsText =
      c.sessions.length > 0
        ? c.sessions
            .map(
              s =>
                `- ${new Date(s.date).toLocaleDateString('ar-EG')}: ${s.type}${s.result ? ' - النتيجة: ' + s.result : ''}`
            )
            .join('\n')
        : 'لا توجد جلسات مسجلة'

    const prompt = `
أنت مساعد قانوني خبير. قدم ملخصاً شاملاً للقضية التالية:

معلومات القضية:
- الرقم الداخلي: ${c.internalId}
- رقم القضية: ${c.caseNumber} لسنة ${c.year}
- العنوان: ${c.title}
- المحكمة: ${c.jurisdiction} - ${c.branch} - ${c.degree}
- الموكل: ${c.client?.name || 'غير محدد'}
- دور الموكل: ${c.clientRole}
- الخصم: ${c.opponent}
- الحالة الحالية: ${c.status}
- أقرب جلسة: ${c.nextSession
      ? new Date(c.nextSession).toLocaleDateString('ar-EG')
      : 'غير محددة'}
- المحامي المسؤول: ${c.assignedLawyer?.name || 'غير محدد'}
- الوصف: ${c.description || 'غير متوفر'}

سجل الجلسات:
${sessionsText}

قدم الملخص بهذا الهيكل:
1. نظرة عامة على القضية (فقرة واحدة)
2. الوضع الراهن
3. أهم المستجدات
4. الجلسة القادمة وما يجب تحضيره
5. التوصيات الاستراتيجية
6. المخاطر المحتملة وكيفية مواجهتها
`

    const model = getGeminiClient()
    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    return res.json({
      summary,
      case: {
        id: c.id,
        title: c.title,
        caseNumber: c.caseNumber,
        status: c.status,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('AI Error:', err)
    return res
      .status(500)
      .json({ error: 'حدث خطأ في تلخيص القضية، حاول مرة أخرى' })
  }
}
