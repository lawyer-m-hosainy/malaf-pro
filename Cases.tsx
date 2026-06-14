import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, FolderKanban, Scale, AlertCircle, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

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

const initialCasesList = [
  { id: 'C-2024-001', internalId: '125/2024', year: '2024', caseNumber: '1540', jurisdiction: 'القضاء العادي', branch: 'القضاء الجنائي', degree: 'جنايات مستأنفة', title: 'جناية تزوير - النيل للتجارة', clientName: 'شركة النيل للتجارة', clientRole: 'متهم', opponent: 'النيابة العامة', status: 'متداولة', nextSession: '2026-07-15' },
  { id: 'C-2024-002', internalId: '126/2024', year: '2023', caseNumber: '980', jurisdiction: 'المحاكم الاقتصادية', branch: 'مدني وتجاري اقتصادي', degree: 'اقتصادي ابتدائي', title: 'نزاع علامة تجارية', clientName: 'مؤسسة الأفق للبرمجيات', clientRole: 'المدعى عليه', opponent: 'شركة المنافس', status: 'محجوزة للحكم', nextSession: '2026-06-25' },
  { id: 'C-2024-003', internalId: '127/2024', year: '2024', caseNumber: '4509', jurisdiction: 'مجلس الدولة', branch: 'القضاء الإداري', degree: 'محكمة القضاء الإداري', title: 'طعن ضريبي - مؤسسة الأهرام', clientName: 'مؤسسة الأهرام للطباعة', clientRole: 'المدعي', opponent: 'وزير المالية (بصفته)', status: 'بالخبراء', nextSession: '2026-06-30' },
  { id: 'C-2024-004', internalId: '15/2022', year: '2022', caseNumber: '211', jurisdiction: 'القضاء العادي', branch: 'القضاء المدني والتجاري', degree: 'استئناف عالي', title: 'إخلاء لعدم سداد الأجرة', clientName: 'ورثة الحاج سعيد', clientRole: 'المدعي (المالك)', opponent: 'يوسف المستأجر', status: 'منتهية', nextSession: '-' },
];

export default function Cases() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const [cases, setCases] = useState(initialCasesList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الجميع');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newCase, setNewCase] = useState({
    title: '', internalId: '', caseNumber: '', year: new Date().getFullYear().toString(),
    jurisdiction: 'القضاء العادي' as Jurisdiction,
    branch: 'القضاء الجنائي',
    degree: 'جنايات أول درجة',
    clientName: '', clientRole: 'المدعي', opponent: ''
  });

  const handleOpenAddModal = () => {
    const year = new Date().getFullYear();
    const nextSeq = cases.length > 0 ? (cases.length * 14) + 124 : 124; // Auto-generated internal sequence
    const generatedInternalId = `${nextSeq}/${year}`;

    setNewCase({
      title: '', internalId: generatedInternalId, caseNumber: '', year: year.toString(),
      jurisdiction: 'القضاء العادي',
      branch: 'القضاء الجنائي',
      degree: 'جنايات أول درجة',
      clientName: '', clientRole: 'المدعي', opponent: ''
    });
    setIsAddModalOpen(true);
  };

  const handleJurisdictionChange = (j: Jurisdiction) => {
    const branches = Object.keys(COURT_STRUCTURE[j]);
    const firstBranch = branches[0];
    const firstDegree = (COURT_STRUCTURE[j] as any)[firstBranch][0];
    
    setNewCase(prev => ({
      ...prev, jurisdiction: j, branch: firstBranch, degree: firstDegree
    }));
  };

  const handleBranchChange = (b: string) => {
    const degrees = (COURT_STRUCTURE[newCase.jurisdiction] as any)[b];
    setNewCase(prev => ({
      ...prev, branch: b, degree: degrees[0]
    }));
  };

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `C-${newCase.year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setCases([{ ...newCase, id: newId, status: 'مفتوحة', nextSession: 'يحدد لاحقاً' }, ...cases]);
    setIsAddModalOpen(false);
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

      {/* Quick Stats */}
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
           {/* Filters */}
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
            
            <form onSubmit={handleAddCase} className="p-4 overflow-y-auto">
              <div className="space-y-6">
                
                {/* القسم الأول: بيانات القضية الأساسية */}
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h4 className="text-sm font-semibold text-primary mb-2">البيانات الأساسية وأرشيف المكتب</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-sm font-medium">عنوان معبر للقضية <span className="text-destructive">*</span></label>
                      <Input required placeholder="مثال: جناية تزوير - شركة النيل" value={newCase.title} onChange={e => setNewCase({...newCase, title: e.target.value})} />
                    </div>
                    <div className="space-y-2 w-full lg:col-span-2">
                      <label className="text-sm font-medium text-indigo-700 dark:text-indigo-400 font-bold">رقم الأرشيف الداخلي للمكتب (يُصدر آلياً) <span className="text-destructive">*</span></label>
                      <div className="flex h-10 w-full items-center justify-end rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/40 px-3 py-2 text-sm text-indigo-700 dark:text-indigo-400 font-mono font-bold cursor-not-allowed select-none" dir="ltr">
                         {newCase.internalId}
                      </div>
                      <p className="text-[10px] text-muted-foreground">يتم إصدار هذا الرقم تلقائياً من المنصة لضمان تسلسل الأرشيف ومنع التلاعب، وسيُخصص للملف بشكل دائم.</p>
                    </div>
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium">رقم الدعوى (للدرجة الحالية) <span className="text-destructive">*</span></label>
                      <Input required placeholder="مثال: 12345" value={newCase.caseNumber} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} dir="ltr" className="text-right" />
                    </div>
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium">لسنة <span className="text-destructive">*</span></label>
                      <Input required placeholder="سنة مقامة الدعوى" value={newCase.year} onChange={e => setNewCase({...newCase, year: e.target.value})} dir="ltr" className="text-right" />
                    </div>
                  </div>
                </div>

                {/* القسم الثاني: الاختصاص والمحكمة */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 space-y-4">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">جهة التقاضي والاختصاص</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الجهة القضائية</label>
                      <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={newCase.jurisdiction}
                        onChange={e => handleJurisdictionChange(e.target.value as Jurisdiction)}>
                        {Object.keys(COURT_STRUCTURE).map(j => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">التصنيف / الفرع</label>
                      <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={newCase.branch}
                        onChange={e => handleBranchChange(e.target.value)}>
                        {Object.keys(COURT_STRUCTURE[newCase.jurisdiction]).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-400">درجة التقاضي</label>
                      <select required className="flex h-10 w-full rounded-md border border-blue-200 dark:border-blue-800 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        value={newCase.degree}
                        onChange={e => setNewCase({...newCase, degree: e.target.value})}>
                        {((COURT_STRUCTURE[newCase.jurisdiction] as any)[newCase.branch] || []).map((deg: string) => (
                          <option key={deg} value={deg}>{deg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* القسم الثالث: أطراف الخصومة */}
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h4 className="text-sm font-semibold text-primary mb-2">أطراف الدعوى</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اسم الموكل <span className="text-destructive">*</span></label>
                        <Input required placeholder="اسم أو شركة الموكل..." value={newCase.clientName} onChange={e => setNewCase({...newCase, clientName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">صفة الموكل بالدعوى <span className="text-destructive">*</span></label>
                        <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={newCase.clientRole}
                          onChange={e => setNewCase({...newCase, clientRole: e.target.value})}>
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
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <label className="text-sm font-medium">اسم الخصم <span className="text-destructive">*</span></label>
                        <Input required placeholder="اسم الخصم (شخص أو جهة)" value={newCase.opponent} onChange={e => setNewCase({...newCase, opponent: e.target.value})} />
                      </div>
                    </div>
                </div>

              </div>
              
              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                <Button type="submit" className="gap-2">حفظ ملف القضية (جاري التطوير)</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

