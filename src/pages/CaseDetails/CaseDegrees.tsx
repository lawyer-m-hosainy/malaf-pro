import { Link } from 'react-router-dom';
import { Scale, Plus, Gavel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CaseDegrees({ caseData, litigationDegrees }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" /> تسلسل درجات التقاضي للقضية
        </h3>
        <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> تصعيد لدرجة جديدة (استئناف/نقض)</Button>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg border flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold">رقم الأرشيف المرجعي (ثابت): <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xl">{caseData.internalId}</span></h4>
          <p className="text-sm text-muted-foreground mt-1">يُشير هذا الرقم لملف القضية الموحد الخاص بك، والذي يحتوي على كافة درجات التقاضي الخاصة بنفس الموضوع.</p>
        </div>
      </div>
      
      <div className="grid gap-4">
        {litigationDegrees.map((deg: any) => (
          <Card key={deg.id} className={cn(
            "overflow-hidden transition-all print:border-2 print:border-black print:shadow-none",
            deg.active ? "border-primary/50 shadow-md ring-1 ring-primary/20 scale-[1.01]" : ""
          )}>
            <div className={cn(
              "h-1.5 w-full print:hidden",
              deg.active ? "bg-primary" : "bg-muted"
            )} />
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch">
                  <div className={cn(
                    "p-4 flex flex-col justify-center items-center text-center min-w-[140px] border-l",
                    deg.active ? "bg-primary/5 text-primary" : "bg-muted/30"
                  )}>
                    <Gavel className={cn("h-6 w-6 mb-2", deg.active ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-bold", deg.active ? "text-lg" : "")}>{deg.type}</span>
                    {deg.active && <span className="mt-1 px-2 py-0.5 rounded text-[10px] bg-primary text-primary-foreground font-bold">الدرجة الحالية</span>}
                  </div>

                  <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">رقم الدعوى والسنة</p>
                        <p className="font-bold text-lg font-mono" dir="ltr">{deg.caseNumber !== '-' ? `${deg.caseNumber} / ${deg.year}` : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">المحكمة المختصة</p>
                        <p className="font-semibold text-base">{deg.court}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2 bg-muted/40 p-3 rounded-md">
                        <p className="text-xs font-medium text-muted-foreground">آخر حكم أو قرار في هذه الدرجة</p>
                        <p className="font-bold">{deg.result}</p>
                        {deg.date !== '-' && <p className="text-xs text-muted-foreground mt-1">تاريخ الحكم/القرار: {deg.date}</p>}
                        {deg.status === 'منتهية' && (
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
        ))}
      </div>
    </div>
  );
}
