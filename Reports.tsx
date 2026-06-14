import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingDown, Wallet, CheckSquare, Users } from 'lucide-react';

const monthlyFinanceData = [
  { name: 'يناير', income: 45000, expenses: 12000 },
  { name: 'فبراير', income: 52000, expenses: 15000 },
  { name: 'مارس', income: 48000, expenses: 13000 },
  { name: 'أبريل', income: 61000, expenses: 18000 },
  { name: 'مايو', income: 55000, expenses: 14000 },
  { name: 'يونيو', income: 72000, expenses: 20000 },
];

const completionData = [
  { name: 'يناير', completed: 25, total: 30 },
  { name: 'فبراير', completed: 32, total: 40 },
  { name: 'مارس', completed: 45, total: 50 },
  { name: 'أبريل', completed: 38, total: 45 },
  { name: 'مايو', completed: 52, total: 60 },
  { name: 'يونيو', completed: 65, total: 70 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">التقارير التحليلية</h2>
        <p className="text-sm text-muted-foreground mt-1">لوحة تجميعية توضح أرباح المكتب شهرياً، حجم الإنجاز، وتطور الأداء</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرباح الشهرية</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">52,000 ج.م</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600 flex items-center gap-1">
              +12% زيادة عن الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المنصرف الفعلي</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">20,000 ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">
              رسوم ونثريات
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المهام المنجزة</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">65 مهمة</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600 flex items-center gap-1">
              +18% عن الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">كفاءة الفريق</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">92%</div>
            <p className="text-xs text-muted-foreground mt-1">
              نسبة إنجاز المهام في موعدها
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>الأرباح والمصروفات الشهرية</CardTitle>
            <CardDescription>تحليل الأداء المالي خلال الـ 6 أشهر الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFinanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} ج.م`, '']}
                    labelStyle={{ color: 'black' }}
                  />
                  <Area type="monotone" name="الأرباح" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" name="المصروفات" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>تطور إنجاز المهام والإجراءات</CardTitle>
            <CardDescription>مقارنة بين المهام المطلوبة والمهام المنجزة فعلياً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip 
                    formatter={(value: number, name: string) => [value, name === 'completed' ? 'منجزة' : 'إجمالي المهام']}
                    labelStyle={{ color: 'black' }}
                  />
                  <Bar dataKey="total" name="total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
