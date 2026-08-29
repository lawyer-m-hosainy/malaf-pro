// تسميات عربية موحّدة لقيم الـ enums القادمة من الباكند
// (لازم تفضل متطابقة مع backend/prisma/schema.prisma)

export const CASE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'متداولة',
  RESERVED: 'محجوزة للحكم',
  WITH_EXPERTS: 'بالخبراء',
  APPEALED: 'مستأنفة',
  CLOSED: 'منتهية',
  SUSPENDED: 'موقوفة',
};

export const CASE_STATUS_BADGE_CLASS: Record<string, string> = {
  ACTIVE: 'bg-primary/5 text-primary border-primary/20',
  RESERVED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  WITH_EXPERTS: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  APPEALED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
  SUSPENDED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export const SESSION_TYPE_LABELS: Record<string, string> = {
  HEARING: 'مرافعة',
  DOCUMENTS: 'تقديم مستندات',
  EXPERTISE: 'خبرة',
  JUDGMENT: 'حكم',
  OTHER: 'أخرى',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: 'مطلوبة',
  IN_PROGRESS: 'جاري العمل',
  COMPLETED: 'مكتملة',
  CANCELLED: 'ملغاة',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'عاجل جداً',
  HIGH: 'هام',
  MEDIUM: 'متوسط',
  LOW: 'عادي',
};

export const TASK_PRIORITY_BADGE_CLASS: Record<string, string> = {
  URGENT: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  SENT: 'مرسلة',
  PAID: 'مدفوعة',
  OVERDUE: 'متأخرة',
  CANCELED: 'ملغاة',
};
