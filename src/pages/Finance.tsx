import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp, TrendingDown, ArrowDownToLine, Receipt, Printer, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocalStore } from '@/store/useLocalStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { financeSchema, FinanceFormData } from '@/lib/validationSchemas';

export default function Finance() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  
  const finance = useLocalStore(state => state.finance);
  const cases = useLocalStore(state => state.cases);
  const addFinanceItem = useLocalStore(state => state.addFinanceItem);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income_fee' | 'income_expense' | 'expense'>('income_fee');

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FinanceFormData>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  });

  const selectedCaseId = watch('caseId');

  const handleOpenModal = (type: 'income_fee' | 'income_expense' | 'expense') => {
    setTransactionType(type);
    reset({
      type,
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
      caseId: '',
      client: '',
      category: type === 'expense' ? 'رسوم محكمة' : 'دفعة تحت الحساب'
    });
    setIsAddModalOpen(true);
  };

  const onCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setValue('caseId', cid);
    const selectedCase = cases.find(c => c.id === cid);
    if (selectedCase) {
      setValue('client', selectedCase.clientName);
    }
  };

  const onSubmit = (data: FinanceFormData) => {
    const newId = `FIN-${Date.now()}`;
    const selectedCase = cases.find(c => c.id === data.caseId);
    
    addFinanceItem({
      id: newId,
      amount: data.amount,
      type: data.type as any,
      category: data.category,
      date: data.date,
      note: data.note || '',
      status: 'paid',
      title: data.category,
      client: data.client,
      caseNumber: selectedCase?.caseNumber || '',
      year: selectedCase?.year || ''
    });
    
    setIsAddModalOpen(false);
    reset();
  };

  const filteredFinance = finance.filter(f => 
    f.client.includes(searchQuery) || 
    f.note?.includes(searchQuery) || 
    f.category.includes(searchQuery)
  );

  return (
    <div className="space-y-6 relative">
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
              <Button variant="outline" className="gap-2 shadow-sm text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleOpenModal('expense')}>
                <TrendingDown className="h-4 w-4" /> منصرف فعلي (رسوم)
              </Button>
              <Button variant="outline" className="gap-2 shadow-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" onClick={() => handleOpenModal('income_expense')}>
                <TrendingUp className="h-4 w-4" /> استلام مصروفات (أمانة)
              </Button>
              <Button className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleOpenModal('income_fee')}>
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
             <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
               {finance.filter(f => f.type === 'income_fee' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm font-bold">ج.م</span>
             </p>
           </CardContent>
         </Card>
         <Card className="border-blue-200 dark:border-blue-900/50">
           <CardContent className="p-5">
             <p className="text-sm font-bold text-muted-foreground mb-1">إجمالي أمانات المصروفات</p>
             <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
               {finance.filter(f => f.type === 'income_expense' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm font-bold">ج.م</span>
             </p>
           </CardContent>
         </Card>
         <Card className="border-rose-200 dark:border-rose-900/50">
           <CardContent className="p-5">
             <p className="text-sm font-bold text-muted-foreground mb-1">منصرف فعلي (على القضايا)</p>
             <p className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
               {finance.filter(f => f.type === 'expense' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm font-bold">ج.م</span>
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-5 bg-muted/40 h-full">
             <p className="text-sm font-bold text-muted-foreground mb-1">أتعاب متأخرة (مستحقة)</p>
             <p className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
               {finance.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm font-bold">ج.م</span>
             </p>
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
                  <th className="p-4 font-medium">العميل / القضية</th>
                  <th className="p-4 font-medium text-center">المبلغ</th>
                  <th className="p-4 font-medium">التصنيف</th>
                  <th className="p-4 font-medium text-center">التاريخ</th>
                  <th className="p-4 font-medium">الحالة</th>
               </tr>
            </thead>
            <tbody>
               {filteredFinance.map(f => (
                 <tr key={f.id} className="border-b last:border-0 hover:bg-muted/50">
                   <td className="p-4">
                      <p className="font-bold text-base text-indigo-700 dark:text-indigo-400">{f.client}</p>
                      <p className="text-muted-foreground text-xs mt-1 font-semibold">{f.note} {f.caseNumber ? `(قضية رقم ${f.caseNumber})` : ''}</p>
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

      {/* Add Finance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-background rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {transactionType === 'income_fee' ? 'تحصيل أتعاب' :
                 transactionType === 'income_expense' ? 'استلام أمانة مصروفات' : 'إضافة منصرف فعلي'}
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <input type="hidden" {...register('type')} value={transactionType} />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">اختر القضية <span className="text-destructive">*</span></label>
                <select 
                  {...register('caseId')}
                  onChange={onCaseChange}
                  className={`flex h-10 w-full rounded-md border ${errors.caseId ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                >
                  <option value="">-- اختر ملف القضية --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.caseNumber}/{c.year})</option>
                  ))}
                </select>
                {errors.caseId && <p className="text-destructive text-xs mt-1">{errors.caseId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">اسم الموكل <span className="text-destructive">*</span></label>
                <Input 
                  {...register('client')} 
                  readOnly 
                  className="bg-muted/50 cursor-not-allowed" 
                  placeholder="يتم تعبئته تلقائياً" 
                />
                {errors.client && <p className="text-destructive text-xs mt-1">{errors.client.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المبلغ (ج.م) <span className="text-destructive">*</span></label>
                  <Input 
                    type="number"
                    {...register('amount', { valueAsNumber: true })} 
                    className={`text-right font-mono ${errors.amount ? 'border-destructive' : ''}`} 
                    dir="ltr"
                  />
                  {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ المعاملة <span className="text-destructive">*</span></label>
                  <Input 
                    type="date"
                    {...register('date')} 
                    className={errors.date ? 'border-destructive' : ''} 
                  />
                  {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تصنيف المعاملة (بند) <span className="text-destructive">*</span></label>
                <select 
                  {...register('category')}
                  className={`flex h-10 w-full rounded-md border ${errors.category ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                >
                  {transactionType === 'expense' ? (
                    <>
                      <option value="رسوم محكمة">رسوم محكمة</option>
                      <option value="رسوم خبراء">رسوم خبراء</option>
                      <option value="انتقالات ومأموريات">انتقالات ومأموريات</option>
                      <option value="استخراج مستندات">استخراج مستندات</option>
                      <option value="أخرى">أخرى</option>
                    </>
                  ) : transactionType === 'income_fee' ? (
                    <>
                      <option value="مقدم أتعاب">مقدم أتعاب</option>
                      <option value="دفعة تحت الحساب">دفعة تحت الحساب</option>
                      <option value="مؤخر أتعاب">مؤخر أتعاب</option>
                      <option value="أتعاب استشارة">أتعاب استشارة</option>
                    </>
                  ) : (
                    <>
                      <option value="أمانة خبير">أمانة خبير</option>
                      <option value="أمانة رسوم دعوى">أمانة رسوم دعوى</option>
                      <option value="أمانة انتقالات">أمانة انتقالات</option>
                    </>
                  )}
                </select>
                {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات / بيان الإيصال</label>
                <Input 
                  {...register('note')} 
                  placeholder="اكتب أي تفاصيل أو أرقام إيصالات هنا..." 
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                <Button type="submit" className="gap-2">حفظ المعاملة</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
