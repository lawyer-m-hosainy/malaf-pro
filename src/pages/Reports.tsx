import { useReportsData } from '@/hooks/useReportsData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, TrendingUp, TrendingDown, Wallet, Briefcase, Scale, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Reports() {
  const {
    totalCases, openCases, closedCases, pendingCases,
    casesByJurisdiction, totalClients,
    totalIncome, totalPending, totalExpenses, netProfit,
    incomeByMonth, topClients,
    isLoading, error
  } = useReportsData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG').format(amount) + ' جنيه';
  };

  const pieData = Object.entries(casesByJurisdiction || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#1D9E75','#3B8BD4','#E8593C','#BA7517','#7F77DD'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in">
        <h2 className="text-xl font-bold text-muted-foreground">جاري تحميل التقارير...</h2>
      </div>
    );
  }

  if (totalCases === 0 && totalClients === 0 && totalIncome === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in">
        <div className="bg-muted/50 p-6 rounded-full">
          <TrendingUp className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-muted-foreground">لا توجد بيانات كافية لعرض التقرير</h2>
        <p className="text-sm text-muted-foreground">قم بإضافة بعض القضايا والمعاملات المالية أولاً لرؤية التحليلات الذكية هنا</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:m-0 print:p-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">التقارير والإحصائيات الذكية</h2>
          <p className="text-muted-foreground mt-1">نظرة شاملة وتحليلات دقيقة لأداء المكتب المالي والقانوني</p>
        </div>
        <Button onClick={() => window.print()} className="gap-2 shrink-0 shadow-sm transition-transform hover:scale-105">
          <Printer className="h-4 w-4" /> طباعة التقرير
        </Button>
      </div>

      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">تقرير أداء المكتب الشامل</h1>
        <p className="text-muted-foreground mt-2">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* ── بطاقات الإحصائيات ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">إجمالي القضايا</p>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex items-baseline space-x-2 space-x-reverse">
              <h2 className="text-3xl font-bold font-mono">{totalCases}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">منها {closedCases} منتهية بالكامل</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">قضايا متداولة (نشطة)</p>
              <Scale className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline space-x-2 space-x-reverse">
              <h2 className="text-3xl font-bold font-mono">{openCases}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">و {pendingCases} محجوزة للحكم</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">إجمالي الموكلين</p>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex items-baseline space-x-2 space-x-reverse">
              <h2 className="text-3xl font-bold font-mono">{totalClients}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">مُسجلين بالنظام حالياً</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">صافي الربح (الدخل الفعلي)</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-baseline space-x-2 space-x-reverse">
              <h2 className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
                {formatCurrency(netProfit)}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">إجمالي المحصل ناقص المصروفات</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── الإيرادات الشهرية ── */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>الإيرادات المحصلة (آخر 6 أشهر)</CardTitle>
            <CardDescription>تحليل الأرباح الشهرية للمكتب والمحصل الفعلي</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickFormatter={v => `${v} ج`} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(v: number) => [formatCurrency(v), 'الإيرادات']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                />
                <Bar dataKey="إيرادات" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── توزيع القضايا حسب المحكمة ── */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>توزيع القضايا جغرافياً / نوعياً</CardTitle>
            <CardDescription>نسب القضايا المنظورة أمام الجهات القضائية المختلفة</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground font-medium">
                لا توجد قضايا مضافة لعرض التوزيع
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── أكثر الموكلين نشاطاً ── */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>أكثر الموكلين نشاطاً (Top 5)</CardTitle>
            <CardDescription>أهم الموكلين أصحاب أكبر عدد من القضايا في المكتب</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topClients} layout="vertical" margin={{ left: 40, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={100} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(v: number) => [`${v} قضية/قضايا`, 'العدد']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  />
                  <Bar dataKey="cases" fill="#3B8BD4" radius={[0, 6, 6, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground font-medium">
                لا يوجد موكلين لديهم قضايا مسجلة
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── ملخص مالي ── */}
        <div className="col-span-1 space-y-4">
          <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-800 p-4 rounded-full text-emerald-600 dark:text-emerald-300">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">إجمالي الإيرادات المحصلة فعلياً</p>
                <h3 className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatCurrency(totalIncome)}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-800 p-4 rounded-full text-amber-600 dark:text-amber-300">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">مستحقات معلقة (لم تسدد بعد)</p>
                <h3 className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300 mt-1">
                  {formatCurrency(totalPending)}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-rose-100 dark:bg-rose-800 p-4 rounded-full text-rose-600 dark:text-rose-300">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-800 dark:text-rose-400">إجمالي المصروفات المنصرفة</p>
                <h3 className="text-2xl font-black font-mono text-rose-700 dark:text-rose-300 mt-1">
                  {formatCurrency(totalExpenses)}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
