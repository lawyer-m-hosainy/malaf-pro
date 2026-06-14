import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Calendar, FileText, Loader2, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { arEG } from 'date-fns/locale';

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    }
  });

  const { data: today, isLoading: isTodayLoading } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: async () => {
      const res = await api.get('/dashboard/today');
      return res.data;
    }
  });

  const isLoading = isStatsLoading || isTodayLoading;

  const chartData = stats?.casesByJurisdiction?.map((j: any) => ({
    name: j.name,
    "قضايا": j.value
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.newClientsThisMonth || 0} هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القضايا المتداولة</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCases || 0}</div>
            <p className="text-xs text-muted-foreground">من أصل {stats?.totalCases || 0} قضية إجمالية</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جلسات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today?.sessionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">استشارات اليوم: {today?.consultationsCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات الشهر</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisMonthIncome?.toLocaleString() || 0} <span className="text-sm">ج.م</span></div>
            <p className="text-xs text-muted-foreground">
              {stats?.incomeGrowth ? `${stats.incomeGrowth > 0 ? '+' : ''}${stats.incomeGrowth}% عن الشهر الماضي` : 'لا توجد بيانات مقارنة كافية'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 border-t pt-6 border-border/50">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>توزيع القضايا حسب المحكمة</CardTitle>
          </CardHeader>
          <CardContent className="pl-2" dir="ltr">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
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
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                لا توجد بيانات كافية لعرض الرسم البياني
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>الجلسات القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.upcomingSessions?.length > 0 ? (
                stats.upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="text-center bg-muted rounded-md p-2 min-w-[80px]">
                      <div className="font-bold text-sm text-primary">
                        {format(new Date(session.date), 'dd MMM', { locale: arEG })}
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground">{session.time}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm truncate max-w-[200px]" title={session.case?.title}>{session.case?.title || 'قضية بدون عنوان'}</h4>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={session.case?.jurisdiction}>{session.case?.jurisdiction || 'غير محدد'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                        {session.type === 'HEARING' ? 'مرافعة' : session.type === 'EXPERT' ? 'خبراء' : session.type === 'JUDGMENT' ? 'نطق بالحكم' : session.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  لا توجد جلسات قادمة مسجلة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
