import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CaseTimeline({ caseUpdates }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h3 className="text-lg font-semibold flex items-center gap-2 print:text-black">
        <History className="h-5 w-5 text-primary print:text-black" /> الخط الزمني لتطور الدعوى
      </h3>
      {caseUpdates.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          لا توجد أحداث مسجلة بعد. سيتم تسجيل كل تحديث يطرأ على القضية هنا تلقائياً.
        </div>
      ) : (
        <div className="relative border-r-2 border-muted hover:border-primary/30 transition-colors mx-4 md:mx-6 space-y-8 pb-4 print:border-black">
          {caseUpdates.map((update: any, index: number) => (
            <div key={update.id} className="relative pr-8 print:pr-4 print:pb-4">
              <div className={cn(
                  "absolute -right-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-background flex items-center justify-center print:border-black print:border-2",
                  index === 0 ? "bg-primary print:bg-black" : "bg-muted border-muted-foreground/30 print:bg-white"
              )}>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full bg-muted print:bg-transparent print:border print:border-black font-mono text-xs text-muted-foreground print:text-black">
                    {new Date(update.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <Card className="bg-card print:border-black print:shadow-none">
                  <CardContent className="p-4">
                    <p className="font-semibold print:text-black">{update.details}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
