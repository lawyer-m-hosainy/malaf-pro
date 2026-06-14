import { Wallet, Plus, ArrowDownToLine, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CaseFinance({ financials }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> المصروفات والرسوم والأتعاب
          </h3>
          <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> إضافة حركة مالية</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
              <CardContent className="p-4">
                 <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">إجمالي الأتعاب المحصلة</p>
                 <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 font-mono">
                   {financials.filter((f: any) => f.type === 'income_fee' && f.status === 'paid').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span>
                 </p>
              </CardContent>
           </Card>
           <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
              <CardContent className="p-4">
                 <p className="text-xs font-medium text-blue-800 dark:text-blue-400">أمانات مصروفات محصلة</p>
                 <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2 font-mono">
                   {financials.filter((f: any) => f.type === 'income_expense' && f.status === 'paid').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span>
                 </p>
              </CardContent>
           </Card>
           <Card className="bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
              <CardContent className="p-4">
                 <p className="text-xs font-medium text-rose-800 dark:text-rose-400">إجمالي منصرف فعلي (رسوم)</p>
                 <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2 font-mono">
                   {financials.filter((f: any) => f.type === 'expense' && f.status === 'paid').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span>
                 </p>
              </CardContent>
           </Card>
        </div>

        <Card>
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="border-b">
                <th className="p-4 font-medium">البيان</th>
                <th className="p-4 font-medium">المبلغ (ج.م)</th>
                <th className="p-4 font-medium">التصنيف</th>
                <th className="p-4 font-medium">التاريخ</th>
                <th className="p-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {financials.map((fin: any) => (
                <tr key={fin.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-medium flex items-center gap-2">
                    {fin.type.includes('income') ? <ArrowDownToLine className="h-4 w-4 text-emerald-500" /> : <Receipt className="h-4 w-4 text-rose-500" />}
                    {fin.title}
                  </td>
                  <td className="p-4 font-mono font-bold">
                    <span className={fin.type.includes('income') ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {fin.type.includes('income') ? '+' : '-'}{fin.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      fin.type === 'income_fee' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      fin.type === 'income_expense' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                      "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                    )}>
                      {fin.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs">{fin.date}</td>
                  <td className="p-4">
                    {fin.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">تم الدفع / مقيد</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">مستحق / معلق</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
    </div>
  );
}
