import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp, TrendingDown, ArrowDownToLine, Receipt, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocalStore } from '@/store/useLocalStore';

export default function Finance() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const finance = useLocalStore(state => state.finance);
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">المالية وحسابات الموكلين</h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة الأتعاب، أمانات المصروفات، والمنصرف الفعلي على القضايا</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <>
              <Button variant="outline" className="gap-2 shadow-sm text-destructive hover:text-destructive hover:bg-destructive/10">
                <TrendingDown className="h-4 w-4" /> منصرف فعلي (رسوم)
              </Button>
              <Button variant="outline" className="gap-2 shadow-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                <TrendingUp className="h-4 w-4" /> استلام مصروفات (أمانة)
              </Button>
              <Button className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                <TrendingUp className="h-4 w-4" /> تحصيل أتعاب مكتب
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-emerald-200 dark:border-emerald-900/50">
           <CardContent className="p-5">
             <p className="text-sm font-bold text-muted-foreground mb-1">إجمالي الأتعاب المحصلة</p>
             <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">15,000 <span className="text-sm font-bold">ج.م</span></p>
           </CardContent>
         </Card>
         <Card className="border-blue-200 dark:border-blue-900/50">
           <CardContent className="p-5">
             <p className="text-sm font-bold text-muted-foreground mb-1">إجمالي أمانات المصروفات</p>
             <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">2,000 <span className="text-sm font-bold">ج.م</span></p>
           </CardContent>
         </Card>
         <Card className="border-rose-200 dark:border-rose-900/50">
           <CardContent className="p-5">
             <p className="text-sm font-bold text-muted-foreground mb-1">منصرف فعلي (على القضايا)</p>
             <p className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">350 <span className="text-sm font-bold">ج.م</span></p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-5 bg-muted/40 h-full">
             <p className="text-sm font-bold text-muted-foreground mb-1">أتعاب متأخرة (مستحقة)</p>
             <p className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">5,000 <span className="text-sm font-bold">ج.م</span></p>
           </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
           <div className="relative max-w-sm w-full">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="بحث برقم الإيصال، العميل، أو البيان..." className="pr-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>
           <Button variant="outline" size="sm" className="gap-2 hidden md:flex"><ArrowDownToLine className="h-4 w-4" /> كشف حساب</Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
               <tr className="border-b">
                  <th className="p-4 font-medium">العميل / البيان</th>
                  <th className="p-4 font-medium text-center">المبلغ</th>
                  <th className="p-4 font-medium">التصنيف</th>
                  <th className="p-4 font-medium text-center">التاريخ</th>
                  <th className="p-4 font-medium">الحالة</th>
               </tr>
            </thead>
            <tbody>
               {finance.map(f => (
                 <tr key={f.id} className="border-b last:border-0 hover:bg-muted/50">
                   <td className="p-4">
                      <p className="font-bold text-base text-indigo-700 dark:text-indigo-400">{f.client}</p>
                      <p className="text-muted-foreground text-xs mt-1 font-semibold">{f.note}</p>
                   </td>
                   <td className="p-4 text-center">
                      <span className={cn(
                        "font-mono text-lg font-black block",
                        ['income_fee', 'income_expense'].includes(f.type) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {['income_fee', 'income_expense'].includes(f.type) ? '+' : '-'}{f.amount.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </span>
                   </td>
                   <td className="p-4 font-bold text-muted-foreground">
                      <span className={cn(
                         "px-2 py-0.5 rounded text-xs",
                         f.type === 'income_fee' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                         f.type === 'income_expense' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                         "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                      )}>
                        {f.category}
                      </span>
                   </td>
                   <td className="p-4 text-center font-mono text-xs">{f.date}</td>
                   <td className="p-4">
                      {f.status === 'paid' ? (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                          مقيدة (مدفوعة)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                          معلقة (مستحقة)
                        </span>
                      )}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
