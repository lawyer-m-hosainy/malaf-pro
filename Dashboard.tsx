import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Calendar, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'يناير', قضايا: 40, استشارات: 24 },
  { name: 'فبراير', قضايا: 30, استشارات: 13 },
  { name: 'مارس', قضايا: 20, استشارات: 58 },
  { name: 'أبريل', قضايا: 27, استشارات: 39 },
  { name: 'مايو', قضايا: 18, استشارات: 48 },
  { name: 'يونيو', قضايا: 23, استشارات: 38 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموكلين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+12 الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القضايا النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+4 الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جلسات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 قضايا عمالية، 4 مدني</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستندات المصاغة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">384</div>
            <p className="text-xs text-muted-foreground">+56 باستخدام الذكاء الاصطناعي</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 border-t pt-6 border-border/50">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة على الأداء</CardTitle>
          </CardHeader>
          <CardContent className="pl-2" dir="ltr">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="قضايا" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="استشارات" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>الجلسات القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { time: '09:00 ص', court: 'محكمة القاهرة الاقتصادية', case: 'قضية تعويض رقم 452', type: 'مرافعة' },
                { time: '11:30 ص', court: 'محكمة شمال القاهرة', case: 'دعوى صحة ونفاذ', type: 'تقديم مستندات' },
                { time: '01:00 م', court: 'مجلس الدولة', case: 'طعن إداري ضد هيئة الضرائب', type: 'نطق بالحكم' }
              ].map((session, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="text-center bg-muted rounded-md p-2 min-w-[70px]">
                    <div className="font-bold text-sm">{session.time}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{session.case}</h4>
                    <p className="text-xs text-muted-foreground">{session.court}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                      {session.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
