import { z } from 'zod';

// Schema القضية
export const caseSchema = z.object({
  title: z.string()
    .min(3, 'عنوان القضية لازم يكون 3 حروف على الأقل')
    .max(100, 'عنوان القضية طويل جداً'),
  caseNumber: z.string()
    .min(1, 'رقم القضية مطلوب'),
  year: z.string()
    .regex(/^\d{4}$/, 'السنة لازم تكون 4 أرقام'),
  clientName: z.string()
    .min(2, 'اسم الموكل مطلوب'),
  clientRole: z.string()
    .min(2, 'صفة الموكل مطلوبة'),
  opponent: z.string()
    .min(2, 'اسم الخصم مطلوب'),
  jurisdiction: z.string()
    .min(1, 'الجهة / التصنيف مطلوب'),
  branch: z.string()
    .min(1, 'الفرع مطلوب'),
  degree: z.string()
    .min(1, 'درجة التقاضي مطلوبة'),
});

// Schema الموكل
export const clientSchema = z.object({
  name: z.string()
    .min(2, 'الاسم لازم يكون حرفين على الأقل'),
  type: z.string()
    .min(1, 'نوع الموكل مطلوب'),
  nationality: z.string()
    .min(1, 'الجنسية مطلوبة'),
  identityLabel: z.string()
    .min(1, 'نوع الهوية مطلوب'),
  identityNumber: z.string()
    .min(1, 'رقم الهوية مطلوب'),
  phone: z.string()
    .regex(/^01[0125]\d{8}$/, 'رقم الموبايل غير صحيح')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),
});

// Schema المالية
export const financeSchema = z.object({
  caseId: z.string().min(1, 'رقم القضية مطلوب'),
  client: z.string().min(1, 'اسم الموكل مطلوب'),
  amount: z.number({ invalid_type_error: 'المبلغ مطلوب ويجب أن يكون رقماً' })
    .positive('المبلغ لازم يكون أكبر من صفر'),
  type: z.string().min(1, 'نوع المعاملة مطلوب'),
  category: z.string()
    .min(1, 'تصنيف المعاملة مطلوب'),
  date: z.string()
    .min(1, 'التاريخ مطلوب'),
  note: z.string().optional(),
});

export type CaseFormData = z.infer<typeof caseSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type FinanceFormData = z.infer<typeof financeSchema>;
