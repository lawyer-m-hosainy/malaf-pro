import { History, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CaseTimeline({ sessions }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h3 className="text-lg font-semibold flex items-center gap-2 print:text-black">
        <History className="h-5 w-5 text-primary print:text-black" /> الخط الزمني لتطور الدعوى
      </h3>
      <div className="relative border-r-2 border-muted hover:border-primary/30 transition-colors mx-4 md:mx-6 space-y-8 pb-4 print:border-black">
        {sessions.map((session: any, index: number) => (
          <div key={index} className="relative pr-8 print:pr-4 print:pb-4">
            <div className={cn(
                "absolute -right-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-background flex items-center justify-center print:border-black print:border-2",
                session.status === 'past' ? "bg-primary print:bg-black" : "bg-muted border-muted-foreground/30 print:bg-white"
            )}>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-foreground print:text-black">{session.type}</span>
                <span className="px-2 py-0.5 rounded-full bg-muted print:bg-transparent print:border print:border-black font-mono text-xs text-muted-foreground print:text-black">{session.date}</span>
              </div>
              <Card className="bg-card print:border-black print:shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground print:text-gray-700">القرار / ما تم في الجلسة</p>
                    <p className="font-semibold mt-1 print:text-black">{session.decision}</p>
                  </div>
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/30 print:border-black print:bg-transparent">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 print:text-black" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400 print:text-black font-bold">الطلبات أو الإجراء المطلوب تنفيذه</p>
                      <p className="text-sm mt-0.5 text-foreground print:text-black">{session.requirements}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
