import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Gavel, Scale, AlertCircle, CheckCircle2, Link as LinkIcon, FileCheck, X, FileText, ArrowRight, Save, LayoutDashboard, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const initialExecutions = [
  { id: 'EXE-2024-001', caseId: 'C-2024-001', caseNumber: '1540', year: '2024', executionNumber: '450', title: 'تنفيذ حكم مدني - تعويض', applicant: 'أحمد محمود', respondent: 'شركة التأمين', type: 'تنفيذ مدني', status: 'جاري الحجز', amount: '150,000 ج.م', date: '2024-05-10' },
  { id: 'EXE-2024-002', caseId: 'C-2022-211', caseNumber: '211', year: '2022', executionNumber: '112', title: 'تنفيذ طرد لعدم سداد الأجرة', applicant: 'المالك (موكلنا)', respondent: 'المستأجر', type: 'محضرين تنفيذ', status: 'تم التسليم', amount: '-', date: '2024-01-15' },
  { id: 'EXE-2024-003', caseId: 'C-2023-980', caseNumber: '980', year: '2023', executionNumber: '89', title: 'صيغة تنفيذية - غرامة اقتصادية', applicant: 'النيابة العامة', respondent: 'موكلنا', type: 'إدارة التنفيذ الجنائي', status: 'جاري المعارضة الاستئنافية', amount: '500,000 ج.م', date: '2024-06-01' },
];

export default function Execution() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const [executions, setExecutions] = useState(initialExecutions);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [executionSource, setExecutionSource] = useState<'linked' | 'independent'>('linked');
  const [selectedExecution, setSelectedExecution] = useState<typeof initialExecutions[0] | null>(null);

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
             <Input placeholder="بحث برقم التنفيذ، رقم القضية، أو الأطراف..." className="pr-10 w-full" />
           </div>
           
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="flex h-9 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                 <option value="">جميع أنواع التنفيذ</option>
                 <option value="تنفيذ مدني">تنفيذ مدني</option>
                 <option value="محضرين تنفيذ">محضرين تنفيذ (طرد وتسليم)</option>
                 <option value="تنفيذ أحوال شخصية">تنفيذ أحوال شخصية</option>
                 <option value="إدارة التنفيذ الجنائي">إدارة التنفيذ الجنائي</option>
              </select>
           </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
           <div className="min-w-[800px]">
             <table className="w-full text-sm text-right">
               <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                     <th className="p-4 font-medium">سند التنفيذ</th>
                     <th className="p-4 font-medium">الارتباط بالقضية الأم</th>
                     <th className="p-4 font-medium">طالب التنفيذ / المنفذ ضده</th>
                     <th className="p-4 font-medium">المبلغ / الحق العيني</th>
                     <th className="p-4 font-medium">حالة التنفيذ</th>
                     <th className="p-4 font-medium text-center">إجراءات</th>
                  </tr>
               </thead>
               <tbody>
                  {executions.map(item => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                       <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg border border-primary/20 shrink-0">
                               <Gavel className="h-4 w-4" />
                             </div>
                             <div className="flex flex-col">
                               <span className="font-semibold line-clamp-1">{item.title}</span>
                               <span className="text-[11px] text-muted-foreground mt-0.5">
                                 رقم <span className="font-mono text-foreground" dir="ltr">{item.executionNumber}</span> لسنة <span className="font-mono text-foreground">{item.year}</span>
                               </span>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                         <div className="flex flex-col gap-1.5">
                           <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
                             <Scale className="h-3 w-3" />
                             {item.type}
                           </span>
                           <Link to={`/dashboard/cases/${item.caseId}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline group">
                             <LinkIcon className="h-3 w-3 group-hover:rotate-45 transition-transform" />
                             القضية الأم: {item.caseNumber}/{item.year}
                           </Link>
                         </div>
                       </td>
                       <td className="p-4">
                          <div className="flex flex-col text-xs space-y-1">
                             <div className="flex justify-between items-center bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded">
                               <span>طالب التنفيذ:</span>
                               <span className="font-medium truncate max-w-[100px]">{item.applicant}</span>
                             </div>
                             <div className="flex justify-between items-center bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 px-2 py-1 rounded mt-1">
                               <span>المنفذ ضده:</span>
                               <span className="font-medium truncate max-w-[100px]">{item.respondent}</span>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="font-mono font-semibold text-sm">
                            {item.amount}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">تاريخ فتح الملف: <span className="font-mono">{item.date}</span></div>
                       </td>
                       <td className="p-4">
                         <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                           item.status === 'جاري الحجز' || item.status.includes('جاري') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                           item.status === 'تم التسليم' || item.status === 'منفذ' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                           'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                         }`}>
                           {item.status.includes('تم') ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                           {item.status}
                         </span>
                       </td>
                       <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-1">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" title="خطوات التنفيذ">
                             <FileCheck className="h-4 w-4" />
                           </Button>
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

      {/* New Execution Document Modal / Slide-over */}
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
                
                {/* Source Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">مصدر السند التنفيذي</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${executionSource === 'linked' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
                      onClick={() => setExecutionSource('linked')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <LinkIcon className={`h-5 w-5 ${executionSource === 'linked' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${executionSource === 'linked' ? 'border-primary' : 'border-muted-foreground'}`}>
                          {executionSource === 'linked' && <div className="h-2 w-2 bg-primary rounded-full" />}
                        </div>
                      </div>
                      <p className="font-bold text-sm">مرتبط بقضية سابقة</p>
                      <p className="text-xs text-muted-foreground mt-1">حكم صادر في دعوى متداولة بالمكتب</p>
                    </div>

                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${executionSource === 'independent' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
                      onClick={() => setExecutionSource('independent')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FileText className={`h-5 w-5 ${executionSource === 'independent' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${executionSource === 'independent' ? 'border-primary' : 'border-muted-foreground'}`}>
                          {executionSource === 'independent' && <div className="h-2 w-2 bg-primary rounded-full" />}
                        </div>
                      </div>
                      <p className="font-bold text-sm">سند مستقل (جديد)</p>
                      <p className="text-xs text-muted-foreground mt-1">شيك، إيصال، أو حكم خارجي</p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-border my-2" />

                {/* Form Fields */}
                <div className="space-y-4">
                  
                  {executionSource === 'linked' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">اربط برقم القضية الأصلية (أرشيف المكتب)</label>
                      <div className="flex gap-2">
                        <Input placeholder="مثال: 125/2024" dir="ltr" className="font-mono text-left w-32" />
                        <Button variant="outline" className="flex-1 bg-muted/20 justify-start text-muted-foreground font-normal">
                          <Search className="h-4 w-4 ml-2" />
                          بحث في القضايا...
                        </Button>
                      </div>
                    </div>
                  )}

                  {executionSource === 'independent' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">نوع السند المستقل</label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                         <option>شيك بنكي مطبوع</option>
                         <option>إيصال أمانة</option>
                         <option>حكم محكمة خارجي</option>
                         <option>عقد موثق (صيغة تنفيذية)</option>
                         <option>سند إذن</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">طالب التنفيذ (موكلنا غالباً)</label>
                      <Input placeholder="اسم طالب التنفيذ" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">المنفذ ضده (الخصم)</label>
                      <Input placeholder="اسم المنفذ ضده" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">موضوع أو مبلغ التنفيذ</label>
                    <Input placeholder="مثال: مبلغ 150,000 ج.م، أو إخلاء وتسليم عين..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary flex items-center gap-1">
                      <LayoutDashboard className="h-4 w-4" /> 
                      التصنيف الوظيفي لملف التنفيذ
                    </label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-primary/5 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                       <option>محضرين تنفيذ (مدني/أسرة)</option>
                       <option>إدارة قضايا المطالبات (تنفيذ جنائي)</option>
                       <option>جنح مباشرة (شيكات وإيصالات)</option>
                    </select>
                  </div>

                </div>

                {/* Generated Numbers Review */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 mt-4">
                   <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      الترقيم الآلي المستقل لملفات التنفيذ
                   </p>
                   <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">رقم أرشيف التنفيذ المستقل:</span>
                        <span className="font-mono font-black text-lg text-foreground" dir="ltr">EXE-129/2024</span>
                      </div>
                      {executionSource === 'linked' && (
                        <>
                          <ArrowRight className="h-5 w-5 text-amber-500/50" />
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">رقم أرشيف الدعوى الأصلية:</span>
                            <span className="font-mono font-bold text-lg text-foreground opacity-70" dir="ltr">C-088/2024</span>
                          </div>
                        </>
                      )}
                   </div>
                </div>

             </div>

             <div className="p-4 border-t bg-muted/10 flex gap-3">
                <Button className="flex-1 gap-2">
                  <Save className="h-4 w-4" /> حفظ وفتح ملف التنفيذ
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
                  <h3 className="font-bold text-lg sm:text-xl">{selectedExecution.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="font-mono text-foreground font-semibold" dir="ltr">{selectedExecution.id}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1"><Scale className="h-3 w-3"/> {selectedExecution.type}</span>
                  </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setSelectedExecution(null)}>
                 <X className="h-5 w-5" />
               </Button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:p-0 print:border-none">
                
                {/* Meta Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-xl p-4 border border-secondary/50">
                     <p className="text-xs text-muted-foreground mb-1">طالب التنفيذ</p>
                     <p className="font-semibold text-sm">{selectedExecution.applicant}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4 border border-secondary/50">
                     <p className="text-xs text-muted-foreground mb-1">المنفذ ضده</p>
                     <p className="font-semibold text-sm">{selectedExecution.respondent}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">المبلغ / الحق העيني</span>
                     <span className="font-mono font-bold text-lg">{selectedExecution.amount}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">الحالة الحالية</span>
                     <span className="font-semibold text-sm">{selectedExecution.status}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">تاريخ الفتح</span>
                     <span className="font-mono text-sm">{selectedExecution.date}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">لارتباط بالقضية</span>
                     {selectedExecution.caseNumber ? (
                         <span className="font-mono text-sm" dir="ltr">{selectedExecution.caseNumber}/{selectedExecution.year}</span>
                     ) : (
                         <span className="text-sm">مستقل</span>
                     )}
                   </div>
                </div>

                <div className="w-full h-px bg-border my-6"></div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h4 className="font-bold">خطوات وإجراءات التنفيذ</h4>
                     {isAdminOrOwner && (
                       <Button size="sm" variant="outline" className="gap-1 print:hidden"><Plus className="h-3 w-3"/> إضافة إجراء</Button>
                     )}
                  </div>
                  
                  {/* Timeline Placeholder */}
                  <div className="space-y-4 border-r-2 border-primary/20 pr-4">
                     <div className="relative">
                        <div className="absolute -right-[23px] top-1 h-3 w-3 rounded-full bg-primary border-4 border-background"></div>
                        <p className="text-sm font-semibold">فتح ملف التنفيذ</p>
                        <p className="text-xs text-muted-foreground mt-1">تاريخ: {selectedExecution.date}</p>
                     </div>
                     <div className="relative">
                        <div className="absolute -right-[23px] top-1 h-3 w-3 rounded-full bg-muted-foreground border-4 border-background opacity-50"></div>
                        <p className="text-sm font-semibold text-muted-foreground">استخراج الصيغة التنفيذية</p>
                        <p className="text-xs text-muted-foreground mt-1">قيد الانتظار</p>
                     </div>
                  </div>
                </div>

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
