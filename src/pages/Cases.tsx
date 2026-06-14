import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, FolderKanban, Scale, AlertCircle, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocalStore } from '@/store/useLocalStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { caseSchema, CaseFormData } from '@/lib/validationSchemas';

const COURT_STRUCTURE = {
  "القضاء العادي": {
    "القضاء الجنائي": ["مخالفات", "جنح", "جنح مستأنفة", "جنايات أول درجة", "جنايات مستأنفة", "نقض جنائي"],
    "القضاء المدني والتجاري": ["جزئي", "ابتدائي (كلي)", "استئناف عالي", "نقض مدني"],
    "محاكم الأسرة": ["أسرة أول درجة", "استئناف أسرة", "نقض أسرة"],
    "العمالي": ["عمالي جزئي", "عمالي كلي", "استئناف عالي", "نقض"]
  },
  "المحاكم الاقتصادية": {
    "جنائي اقتصادي": ["جنح اقتصادية", "جنح مستأنفة اقتصادية", "جنايات اقتصادية", "جنايات مستأنفة اقتصادية"],
    "مدني وتجاري اقتصادي": ["اقتصادي ابتدائي", "اقتصادي استئنافي", "نقض"]
  },
  "مجلس الدولة": {
    "القضاء الإداري": ["محكمة القضاء الإداري", "المحاكم الإدارية", "المحكمة الإدارية العليا"],
    "القضاء التأديبي": ["المحاكم التأديبية", "المحكمة الإدارية العليا"],
    "التحضير": ["هيئة مفوضي الدولة"]
  },
  "القضاء العسكري": {
    "المحاكم العسكرية": ["جنح عسكرية", "جنح مستأنفة عسكرية", "جنايات عسكرية", "طعون عسكرية"]
  },
  "جهات أخرى": {
    "المحكمة الدستورية العليا": ["دعوى دستورية", "تنازع اختصاص و أحكام"],
    "النيابة العامة والتحقيق": ["نيابة جزئية", "نيابة كلية", "استئناف", "قاضي التحقيق"]
  }
};

type Jurisdiction = keyof typeof COURT_STRUCTURE;

export default function Cases() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const cases = useLocalStore((state) => state.cases);
  const addCase = useLocalStore((state) => state.addCase);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الجميع');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [internalId, setInternalId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      jurisdiction: 'القضاء العادي',
      branch: 'القضاء الجنائي',
      degree: 'جنايات أول درجة',
      clientRole: 'المدعي',
      year: new Date().getFullYear().toString()
    }
  });

  const selectedJurisdiction = watch('jurisdiction') as Jurisdiction;
  const selectedBranch = watch('branch');

  const handleOpenAddModal = () => {
    const year = new Date().getFullYear();
    const nextSeq = cases.length > 0 ? (cases.length * 14) + 124 : 124;
    setInternalId(`${nextSeq}/${year}`);
    reset({
      year: year.toString(),
      jurisdiction: 'القضاء العادي',
      branch: 'القضاء الجنائي',
      degree: 'جنايات أول درجة',
      clientRole: 'المدعي'
    });
    setIsAddModalOpen(true);
  };

  const onJurisdictionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const j = e.target.value as Jurisdiction;
    setValue('jurisdiction', j);
    const branches = Object.keys(COURT_STRUCTURE[j]);
    const firstBranch = branches[0];
    const firstDegree = (COURT_STRUCTURE[j] as any)[firstBranch][0];
    setValue('branch', firstBranch);
    setValue('degree', firstDegree);
  };

  const onBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const b = e.target.value;
    setValue('branch', b);
    const degrees = (COURT_STRUCTURE[selectedJurisdiction] as any)[b];
    setValue('degree', degrees[0]);
  };

  const onSubmit = (data: CaseFormData) => {
    const newId = `C-${data.year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    addCase({
      id: newId,
      internalId,
      title: data.title,
      caseNumber: data.caseNumber,
      year: data.year,
      jurisdiction: data.jurisdiction,
      branch: data.branch,
      degree: data.degree,
      clientName: data.clientName,
      clientRole: data.clientRole,
      opponent: data.opponent,
      status: 'مفتوحة',
      nextSession: 'يحدد لاحقاً'
    });
    setIsAddModalOpen(false);
    reset();
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.includes(searchQuery) || c.caseNumber.includes(searchQuery) || c.opponent.includes(searchQuery) || c.clientName.includes(searchQuery);
    const matchesStatus = statusFilter === 'الجميع' ? true :
      statusFilter === 'مفتوحة' ? (c.status === 'متداولة' || c.status === 'مفتوحة' || c.status === 'بالخبراء') :
      statusFilter === 'محجوزة' ? c.status === 'محجوزة للحكم' :
      statusFilter === 'منتهية' ? c.status === 'منتهية' : true;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'إجمالي القضايا', value: cases.length, color: 'text-primary' },
    { label: 'متداولة / نشطة', value: cases.filter(c => ['مفتوحة', 'متداولة', 'بالخبراء'].includes(c.status)).length, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'محجوزة للحكم', value: cases.filter(c => c.status === 'محجوزة للحكم').length, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'منتهية', value: cases.filter(c => c.status === 'منتهية').length, color: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إدارة القضايا والملفات</h2>
          <p className="text-sm text-muted-foreground mt-1">تنظيم ومتابعة القضايا وفقاً لدرجات التقاضي في جميع الدوائر</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <Button className="gap-2" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4" /> فتح ملف قضية جديد
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex flex-col justify-center text-center">
              <span className="text-2xl font-bold font-mono">{stat.value}</span>
              <span className={`text-sm font-semibold mt-1 ${stat.color}`}>{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
           <div className="relative w-full sm:w-80 md:w-96">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="بحث برقم القضية، الموكل، الخصم..." 
               className="pr-10 w-full"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="flex bg-muted/50 p-1 border rounded-lg overflow-x-auto w-full sm:w-auto">
             {['الجميع', 'مفتوحة', 'محجوزة', 'منتهية'].map(f => (
               <button
                 key={f}
                 onClick={() => setStatusFilter(f)}
                 className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${statusFilter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
               >
                 {f}
               </button>
             ))}
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="relative w-full overflow-auto">
             <table className="w-full text-sm text-right">
               <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                     <th className="p-4 font-medium min-w-[200px]">القضية (الرقم والسنة)</th>
                     <th className="p-4 font-medium min-w-[200px]">المحكمة والدرجة</th>
                     <th className="p-4 font-medium">الخصوم والصفة</th>
                     <th className="p-4 font-medium min-w-[120px]">تاريخ الجلسة</th>
                     <th className="p-4 font-medium">الحالة</th>
                     <th className="p-4 font-medium text-center">إجراءات</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredCases.map(item => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                       <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg border border-primary/20 shrink-0">
                               <FolderKanban className="h-4 w-4" />
                             </div>
                             <div className="flex flex-col">
                               <span className="font-semibold line-clamp-1" title={item.title}>{item.title}</span>
                               <span className="text-[11px] text-muted-foreground mt-0.5">
                                 رقم قضايا <span className="font-mono text-foreground" dir="ltr">{item.caseNumber}</span> لسنة <span className="font-mono text-foreground">{item.year}</span>
                               </span>
                               <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-tight mt-0.5">
                                 أرشيف المكتب: <span className="font-mono">{item.internalId}</span>
                               </span>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                         <div className="flex flex-col gap-1">
                           <span className="font-medium text-[13px]">{item.jurisdiction}</span>
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Scale className="h-3 w-3 shrink-0" />
                              <span className="bg-muted px-1.5 py-0.5 rounded-sm line-clamp-1">{item.degree}</span>
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                          <div className="flex flex-col text-xs space-y-1">
                             <div className="flex justify-between items-center bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded">
                               <span>موكلنا:</span>
                               <span className="font-bold max-w-[120px] truncate" title={`${item.clientName} (${item.clientRole})`}>{item.clientName || 'غير محدد'} <span className="font-normal opacity-70">({item.clientRole})</span></span>
                             </div>
                             <div className="flex justify-between items-center bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 px-2 py-1 rounded">
                               <span>ضد:</span>
                               <span className="font-bold truncate max-w-[120px]" title={item.opponent}>{item.opponent}</span>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <span className="font-mono text-[13px]">{item.nextSession}</span>
                             {item.nextSession !== '-' && item.nextSession !== 'يحدد لاحقاً' && (
                               <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                             )}
                          </div>
                       </td>
                       <td className="p-4">
                         <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                           item.status === 'متداولة' || item.status === 'مفتوحة' ? 'bg-primary/5 text-primary border-primary/20' :
                           item.status === 'محجوزة للحكم' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                           item.status === 'بالخبراء' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                           'bg-muted text-muted-foreground border-border'
                         }`}>
                           {item.status === 'محجوزة للحكم' && <AlertCircle className="h-3 w-3" />}
                           {item.status}
                         </span>
                       </td>
                       <td className="p-4 text-center">
                         <Link to={`/dashboard/cases/${item.id}`}>
                           <Button variant="default" size="sm" className="h-8 text-xs font-medium">عرض الملف</Button>
                         </Link>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

      {/* Add Case Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-background rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> 
                فتح ملف قضية جديــد
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 overflow-y-auto">
              <div className="space-y-6">
                
                {/* القسم الأول: بيانات القضية الأساسية */}
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h4 className="text-sm font-semibold text-primary mb-2">البيانات الأساسية وأرشيف المكتب</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-sm font-medium">عنوان معبر للقضية <span className="text-destructive">*</span></label>
                      <Input 
                        {...register('title')} 
                        placeholder="مثال: جناية تزوير - شركة النيل" 
                        className={errors.title ? 'border-destructive' : ''} 
                      />
                      {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-2 w-full lg:col-span-2">
                      <label className="text-sm font-medium text-indigo-700 dark:text-indigo-400 font-bold">رقم الأرشيف الداخلي للمكتب (يُصدر آلياً) <span className="text-destructive">*</span></label>
                      <div className="flex h-10 w-full items-center justify-end rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/40 px-3 py-2 text-sm text-indigo-700 dark:text-indigo-400 font-mono font-bold cursor-not-allowed select-none" dir="ltr">
                         {internalId}
                      </div>
                      <p className="text-[10px] text-muted-foreground">يتم إصدار هذا الرقم تلقائياً من المنصة لضمان تسلسل الأرشيف ومنع التلاعب، وسيُخصص للملف بشكل دائم.</p>
                    </div>
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium">رقم الدعوى (للدرجة الحالية) <span className="text-destructive">*</span></label>
                      <Input 
                        {...register('caseNumber')} 
                        placeholder="مثال: 12345" 
                        dir="ltr" 
                        className={`text-right ${errors.caseNumber ? 'border-destructive' : ''}`} 
                      />
                      {errors.caseNumber && <p className="text-destructive text-xs mt-1">{errors.caseNumber.message}</p>}
                    </div>
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium">لسنة <span className="text-destructive">*</span></label>
                      <Input 
                        {...register('year')} 
                        placeholder="سنة مقامة الدعوى" 
                        dir="ltr" 
                        className={`text-right ${errors.year ? 'border-destructive' : ''}`} 
                      />
                      {errors.year && <p className="text-destructive text-xs mt-1">{errors.year.message}</p>}
                    </div>
                  </div>
                </div>

                {/* القسم الثاني: الاختصاص والمحكمة */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 space-y-4">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">جهة التقاضي والاختصاص</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الجهة القضائية <span className="text-destructive">*</span></label>
                      <select 
                        {...register('jurisdiction')}
                        onChange={onJurisdictionChange}
                        className={`flex h-10 w-full rounded-md border ${errors.jurisdiction ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                      >
                        {Object.keys(COURT_STRUCTURE).map(j => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                      {errors.jurisdiction && <p className="text-destructive text-xs mt-1">{errors.jurisdiction.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">التصنيف / الفرع <span className="text-destructive">*</span></label>
                      <select 
                        {...register('branch')}
                        onChange={onBranchChange}
                        className={`flex h-10 w-full rounded-md border ${errors.branch ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                      >
                        {selectedJurisdiction && Object.keys(COURT_STRUCTURE[selectedJurisdiction]).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      {errors.branch && <p className="text-destructive text-xs mt-1">{errors.branch.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-400">درجة التقاضي <span className="text-destructive">*</span></label>
                      <select 
                        {...register('degree')}
                        className={`flex h-10 w-full rounded-md border ${errors.degree ? 'border-destructive' : 'border-blue-200 dark:border-blue-800'} bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold`}
                      >
                        {selectedJurisdiction && selectedBranch && ((COURT_STRUCTURE[selectedJurisdiction] as any)[selectedBranch] || []).map((deg: string) => (
                          <option key={deg} value={deg}>{deg}</option>
                        ))}
                      </select>
                      {errors.degree && <p className="text-destructive text-xs mt-1">{errors.degree.message}</p>}
                    </div>
                  </div>
                </div>

                {/* القسم الثالث: أطراف الخصومة */}
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h4 className="text-sm font-semibold text-primary mb-2">أطراف الدعوى</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اسم الموكل <span className="text-destructive">*</span></label>
                        <Input 
                          {...register('clientName')} 
                          placeholder="اسم أو شركة الموكل..." 
                          className={errors.clientName ? 'border-destructive' : ''} 
                        />
                        {errors.clientName && <p className="text-destructive text-xs mt-1">{errors.clientName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">صفة الموكل بالدعوى <span className="text-destructive">*</span></label>
                        <select 
                          {...register('clientRole')}
                          className={`flex h-10 w-full rounded-md border ${errors.clientRole ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                        >
                          <option value="المدعي">المدعي</option>
                          <option value="المدعى عليه">المدعى عليه</option>
                          <option value="الشاكي">الشاكي</option>
                          <option value="المشكو في حقه">المشكو في حقه</option>
                          <option value="متهم">متهم</option>
                          <option value="مجني عليه">مجني عليه</option>
                          <option value="مدعي بالحق المدني">مدعي بالحق المدني</option>
                          <option value="مسئول عن الحقوق المدنية">مسئول عن الحقوق المدنية</option>
                          <option value="مستأنِف">مستأنِف</option>
                          <option value="مستأنَف ضده">مستأنَف ضده</option>
                          <option value="طاعن">طاعن</option>
                          <option value="مطعون ضده">مطعون ضده</option>
                          <option value="طالب">طالب (في الأوامر والعرائض)</option>
                          <option value="مطلوب ضده">مطلوب ضده</option>
                        </select>
                        {errors.clientRole && <p className="text-destructive text-xs mt-1">{errors.clientRole.message}</p>}
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <label className="text-sm font-medium">اسم الخصم <span className="text-destructive">*</span></label>
                        <Input 
                          {...register('opponent')} 
                          placeholder="اسم الخصم (شخص أو جهة)" 
                          className={errors.opponent ? 'border-destructive' : ''} 
                        />
                        {errors.opponent && <p className="text-destructive text-xs mt-1">{errors.opponent.message}</p>}
                      </div>
                    </div>
                </div>

              </div>
              
              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                <Button type="submit" className="gap-2">حفظ ملف القضية</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
