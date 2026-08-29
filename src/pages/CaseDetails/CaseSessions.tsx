import { CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CaseSessions({ sessions }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> أجندة الجلسات
        </h3>
      </div>
      {sessions.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          لا توجد جلسات مسجلة لهذه القضية بعد.
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session: any) => (
            <Card key={session.id} className={cn(
              "overflow-hidden transition-all hover:shadow-md",
              session.isUpcoming ? "border-primary/50 shadow-sm" : ""
            )}>
              <div className={cn(
                "h-1 w-full",
                session.isUpcoming ? "bg-primary" : "bg-muted"
              )} />
              <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-2 min-w-[80px]">
                    <span className="text-sm font-semibold">{new Date(session.date).toLocaleDateString('ar-EG', { month: 'short' })}</span>
                    <span className="text-2xl font-bold font-mono">{new Date(session.date).getDate()}</span>
                    <span className="text-xs text-muted-foreground">{new Date(session.date).getFullYear()}</span>
                  </div>

                  <div className="space-y-1 mt-1">
                    <h4 className="font-bold text-lg">{session.typeLabel}</h4>
                    <p className="text-sm font-semibold mb-1">القرار: <span className="text-muted-foreground font-normal">{session.result}</span></p>
                    {session.isUpcoming && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-900/40">
                        <Clock className="h-3 w-3" /> جلسة قادمة
                      </span>
                    )}
                    {session.notes && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded border">ملاحظات: <span className="font-semibold text-foreground">{session.notes}</span></p>
                    )}
                  </div>
                </div>
                {session.lawyerName && (
                  <div className="w-full md:w-auto bg-muted/40 p-3 rounded-md border min-w-[250px]">
                    <p className="text-xs font-medium text-muted-foreground mb-1">المحامي الحاضر</p>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">{session.lawyerName.charAt(0)}</div>
                      <span className="text-sm font-medium">{session.lawyerName}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
