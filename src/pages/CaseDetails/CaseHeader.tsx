import { Link } from 'react-router-dom';
import { ArrowRight, FileSignature, Landmark, Scale, Printer, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CaseHeader({ caseData, handlers }: any) {
  return (
    <div className="flex flex-col gap-4 print:hidden">
      <Link to="/dashboard/cases" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
        <ArrowRight className="h-4 w-4 ml-1" />
        العودة لقائمة القضايا
      </Link>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{caseData.title}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {caseData.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              أرشيف المكتب: {caseData.internalId}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5"><FileSignature className="h-4 w-4" /> رقم القضية الحالي: {caseData.currentCaseNumber} لسنة {caseData.currentYear}</span>
            <span className="flex items-center gap-1.5"><Landmark className="h-4 w-4" /> {caseData.court}</span>
            <span className="flex items-center gap-1.5"><Scale className="h-4 w-4" /> {caseData.degree}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handlers.setIsPrintModalOpen(true)}>
            <Printer className="h-4 w-4" /> طباعة الملف
          </Button>
          <Button className="gap-2">
            <CalendarDays className="h-4 w-4" /> إضافة جلسة
          </Button>
        </div>
      </div>
    </div>
  );
}
