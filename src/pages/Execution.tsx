import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Gavel, Scale, AlertCircle, CheckCircle2, Link as LinkIcon, FileCheck, X, FileText, ArrowRight, Save, LayoutDashboard, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function Execution() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [executionSource, setExecutionSource] = useState<'linked' | 'independent'>('linked');
  const [selectedExecution, setSelectedExecution] = useState<any>(null);
  
  const { data: executions = [], isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: async () => {
      const res = await api.get('/executions');
      return res.data.data;
    }
  });

  const [newExecution, setNewExecution] = useState({
    executionNumber: '',
    type: 'تنفيذ مدني',
    court: '',
    status: 'OPEN',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    caseId: ''
  });

  const { mutate: addExecution, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      await api.post('/executions', newExecution);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      setIsAddModalOpen(false);
      setNewExecution({ executionNumber: '', type: 'تنفيذ مدني', court: '', status: 'OPEN', date: new Date().toISOString().split('T')[0], notes: '', caseId: '' });
    }
  });

  const filteredExecutions = executions.filter((item: any) => 
    item.executionNumber.includes(searchQuery) || (item.case?.title || '').includes(searchQuery) || (item.notes || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إدارة التنفيذ والأحكام</h2>
          <p className="text-sm text-muted-foreground mt-1">متابعة السندات التنفيذية وتطورات الأحكام النهائية التي لم يتم استئنافها</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <Button className="gap-2 shadow-sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" /> إضافة سند تنفيذي جديد
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
           <div className="relative w-full sm:w-80 md:w-96">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="بحث برقم التنفيذ، السند..." className="pr-10 w-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
           <div className="min-w-[800px]">
             <table className="w-full text-sm text-right">
               <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                     <th className="p-4 font-medium">رقم التنفيذ / النوع</th>
                     <th className="p-4 font-medium">الارتباط بالقضية الأم</th>
                     <th className="p-4 font-medium">الجهة / المحكمة</th>
                     <th className="p-4 font-medium">حالة التنفيذ</th>
                     <th className="p-4 font-medium text-center">إجراءات</th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل التنفيذات...</td></tr>
                  ) : filteredExecutions.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد ملفات تنفيذ.</td></tr>
                  ) : filteredExecutions.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                       <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg border border-primary/20 shrink-0">
                               <Gavel className="h-4 w-4" />
                             </div>
                             <div className="flex flex-col">
                               <span className="font-semibold line-clamp-1">{item.type}</span>
                               <span className="text-[11px] text-muted-foreground mt-0.5">
                                 رقم <span className="font-mono text-foreground" dir="ltr">{item.executionNumber}</span>
                               </span>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                         <div className="flex flex-col gap-1.5">
                           {item.case ? (
                             <Link to={`/dashboard/cases/${item.caseId}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline group">
                               <LinkIcon className="h-3 w-3 group-hover:rotate-45 transition-transform" />
                               القضية الأم: {item.case.caseNumber} - {item.case.title}
                             </Link>
                           ) : (
                             <span className="text-xs text-muted-foreground">سند مستقل</span>
                           )}
                         </div>
                       </td>
                       <td className="p-4">
                          <span className="font-medium text-xs">{item.court || 'غير محدد'}</span>
                       </td>
                       <td className="p-4">
                         <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                           item.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                           item.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                           'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                         }`}>
                           {item.status === 'CLOSED' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                           {item.status === 'OPEN' ? 'مفتوح' : item.status === 'IN_PROGRESS' ? 'جاري التنفيذ' : item.status === 'CLOSED' ? 'منتهي' : 'موقوف'}
                         </span>
                       </td>
                       <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-1">
                           <Button 
                             variant="default" 
                             size="sm" 
                             className="h-8 text-xs font-medium"
                             onClick={() => setSelectedExecution(item)}
                           >
                             عرض الملف
                           </Button>
                         </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

      {/* New Execution Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-stretch sm:justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-background w-full max-w-xl h-full sm:h-auto sm:min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-left-8 sm:slide-in-from-left-0 sm:slide-in-from-right-8 duration-300">
             <div className="flex items-center justify-between p-4 border-b bg-muted/30">
               <div className="flex items-center gap-3">
                 <div className="bg-primary/10 text-primary p-2 rounded-lg">
                   <FileText className="h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">فتح ملف تنفيذ جديد</h3>
                   <p className="text-xs text-muted-foreground">تسجيل سند تنفيذي واستخراج رقم أرشيف تنفيذ مستقل</p>
                 </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                 <X className="h-5 w-5" />
               </Button>
             </div>

             <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">رقم التنفيذ / السند</label>
                      <Input placeholder="رقم التنفيذ" value={newExecution.executionNumber} onChange={e => setNewExecution({...newExecution, executionNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">تاريخ التنفيذ</label>
                      <Input type="date" value={newExecution.date} onChange={e => setNewExecution({...newExecution, date: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">الجهة / المحكمة</label>
                    <Input placeholder="مثال: محكمة استئناف القاهرة / قلم المحضرين" value={newExecution.court} onChange={e => setNewExecution({...newExecution, court: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">النوع</label>
                    <Input placeholder="تنفيذ مدني، أحوال شخصية، طرد..." value={newExecution.type} onChange={e => setNewExecution({...newExecution, type: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">معلومات التنفيذ (موضوعه)</label>
                    <Input placeholder="مثال: مبلغ 150,000 ج.م، أو إخلاء وتسليم عين..." value={newExecution.notes} onChange={e => setNewExecution({...newExecution, notes: e.target.value})} />
                  </div>
                </div>
             </div>

             <div className="p-4 border-t bg-muted/10 flex gap-3">
                <Button className="flex-1 gap-2" onClick={() => addExecution()} disabled={isAdding}>
                  <Save className="h-4 w-4" /> {isAdding ? 'جاري الحفظ...' : 'حفظ وفتح ملف التنفيذ'}
                </Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  إلغاء
                </Button>
             </div>
           </div>
        </div>
      )}

      {/* Execution Details Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-stretch sm:justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-background w-full max-w-2xl h-full sm:h-auto sm:min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-left-8 sm:slide-in-from-left-0 sm:slide-in-from-right-8 duration-300">
             
             {/* Header */}
             <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-muted/30">
               <div>
                  <h3 className="font-bold text-lg sm:text-xl">ملف رقم {selectedExecution.executionNumber}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Scale className="h-3 w-3"/> {selectedExecution.type}</span>
                  </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setSelectedExecution(null)}>
                 <X className="h-5 w-5" />
               </Button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:p-0 print:border-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">الجهة</span>
                     <span className="font-bold text-lg">{selectedExecution.court}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">الحالة الحالية</span>
                     <span className="font-semibold text-sm">{selectedExecution.status}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">تاريخ الفتح</span>
                     <span className="font-mono text-sm">{new Date(selectedExecution.date).toLocaleDateString('ar-EG')}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">ملاحظات</span>
                     <span className="text-sm">{selectedExecution.notes}</span>
                   </div>
                </div>

                <div className="w-full h-px bg-border my-6"></div>
             </div>

             <div className="p-4 border-t bg-muted/10 flex gap-3 print:hidden">
                <Button className="flex-1 gap-2" variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> طباعة بيانات الملف
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
