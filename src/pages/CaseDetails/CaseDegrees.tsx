import { Link } from 'react-router-dom';
import { Scale, Plus, Gavel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CaseDegrees({ caseData }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" /> بيانات درجة التقاضي الحالية
        </h3>
        <Link to="/dashboard/cases">
          <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> فتح درجة تالية (استئناف/نقض)</Button>
        </Link>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg border">
        <h4 className="font-bold">رقم الأرشيف المرجعي: <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xl">{caseData.internalId}</span></h4>
        <p className="text-sm text-muted-foreground mt-1">
          كل درجة تقاضي (ابتدائي/استئناف/نقض) تُسجَّل كملف قضية مستقل بأرشيف خاص بها. عند صدور حكم في هذه الدرجة، افتح ملفاً جديداً للدرجة التالية وأشر لهذا الملف في بياناته لربطهما.
        </p>
      </div>

      <Card className="overflow-hidden border-primary/50 shadow-md ring-1 ring-primary/20">
        <div className="h-1.5 w-full bg-primary" />
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="p-4 flex flex-col justify-center items-center text-center min-w-[140px] border-l bg-primary/5 text-primary">
              <Gavel className="h-6 w-6 mb-2 text-primary" />
              <span className="font-bold text-lg">{caseData.degree}</span>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] bg-primary text-primary-foreground font-bold">الدرجة الحالية</span>
            </div>

            <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">رقم الدعوى والسنة</p>
                <p className="font-bold text-lg font-mono" dir="ltr">{caseData.currentCaseNumber} / {caseData.currentYear}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">الجهة القضائية والدائرة</p>
                <p className="font-semibold text-base">{caseData.jurisdiction} — {caseData.circuit}</p>
              </div>
              <div className="space-y-1 md:col-span-2 bg-muted/40 p-3 rounded-md">
                <p className="text-xs font-medium text-muted-foreground">الحالة الحالية للقضية</p>
                <p className="font-bold">{caseData.statusLabel}</p>
                {caseData.status === 'CLOSED' && (
                  <div className="mt-3 flex gap-2">
                    <Link to="/dashboard/execution">
                      <Button size="sm" variant="outline" className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40 gap-1 shadow-sm font-bold">
                        <Gavel className="h-3 w-3" /> استخراج صيغة تنفيذية وإحالة للتنفيذ
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
