import { Card, CardContent } from '@/components/ui/card';
import { Users, CalendarDays, MapPin } from 'lucide-react';

export function CaseInfo({ caseData }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 print:hidden">
      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">صفتنا في الدعوى</p>
            <p className="font-bold text-foreground mt-1">{caseData.clientRole}</p>
          </div>
          <Users className="h-8 w-8 text-indigo-500 opacity-20" />
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">الخصم</p>
            <p className="font-bold text-foreground mt-1 line-clamp-1">{caseData.opponent}</p>
          </div>
          <Users className="h-8 w-8 text-rose-500 opacity-20" />
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">تاريخ الجلسة القادمة</p>
            <p className="font-bold text-foreground mt-1 font-mono text-sm">{caseData.nextSession}</p>
          </div>
          <CalendarDays className="h-8 w-8 text-blue-500 opacity-20" />
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">الدائرة</p>
            <p className="font-bold text-foreground mt-1">{caseData.circuit}</p>
          </div>
          <MapPin className="h-8 w-8 text-emerald-500 opacity-20" />
        </CardContent>
      </Card>
    </div>
  );
}
