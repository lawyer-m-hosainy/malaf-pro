import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, History, CalendarDays, FileText, CheckSquare, 
  Wallet, Scale, Users, Clock, CheckCircle2,
  Receipt, FileSignature, Landmark, ChevronLeft, MapPin, Plus,
  AlertCircle, FileArchive, ArrowDownToLine, FileClock, Gavel, Printer, FolderOpen
} from 'lucide-react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CaseDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'timeline' | 'degrees' | 'sessions' | 'tasks' | 'docs' | 'finance'>('timeline');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSections, setPrintSections] = useState({
    cover: true,
    degrees: true,
    timeline: true,
    sessions: true,
    tasks: false,
    docs: false,
    finance: false
  });

  const handlePrint = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => window.print(), 150);
  };

  const togglePrintSection = (key: keyof typeof printSections) => {
    setPrintSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // بيانات افتراضية لمعاينة التميز والتكامل الدقيق للقضية
  const caseData = {
    id: id || 'C-2024-001',
    internalId: '125/2024',
    currentCaseNumber: '1540',
    currentYear: '2024',
    title: 'جناية تزوير - النيل للتجارة',
    jurisdiction: 'القضاء العادي',
    degree: 'جنايات مستأنفة',
    court: 'محكمة استئناف القاهرة',
    circuit: 'الدائرة السابعة جنايات',
    clientRole: 'متهم',
    opponent: 'النيابة العامة',
    status: 'متداولة',
    nextSession: '2026-07-15',
  };

  const tabs = [
    { id: 'timeline', label: 'الخط الزمني (سير الدعوى)', icon: History },
    { id: 'degrees', label: 'تسلسل درجات التقاضي', icon: Scale },
    { id: 'sessions', label: 'أجندة الجلسات', icon: CalendarDays },
    { id: 'tasks', label: 'المهام ومتابعة الشغل', icon: CheckSquare },
    { id: 'docs', label: 'المستندات والمذكرات', icon: FileArchive },
    { id: 'finance', label: 'الرسوم والمصروفات', icon: Wallet },
  ];

  const litigationDegrees = [
    { id: 1, type: 'أول درجة', caseNumber: '890', year: '2023', court: 'محكمة جنايات القاهرة', result: 'حكم بإدانة المتهم (حبس سنة)', date: '2024-02-15', status: 'منتهية', active: false },
    { id: 2, type: 'استئناف', caseNumber: '1540', year: '2024', court: 'محكمة استئناف القاهرة', result: 'متداولة - حجزت للحكم', date: '-', status: 'الحالية', active: true },
    { id: 3, type: 'طعن بالنقض', caseNumber: '-', year: '-', court: 'محكمة النقض', result: 'لم يتم الطعن بعد', date: '-', status: 'مستقبلية', active: false },
  ];

  const sessions = [
    { id: 1, date: '2024-01-15', roll: '45', type: 'جلسة أولى', decision: 'تأجيل للإعلان والمستندات', status: 'past', requirements: 'إعلان الخصوم بصفة رسمية' },
    { id: 2, date: '2024-03-20', roll: '8', type: 'جلسة مرافعة', decision: 'حضور المتهم وطلب أجل للاطلاع', status: 'past', requirements: 'تصوير ملف القضية كامل' },
    { id: 3, date: '2024-05-10', roll: '112', type: 'تقديم مذكرات', decision: 'حجز الدعوى للحكم', status: 'past', requirements: 'إيداع مذكرة الدفاع وحافظة المستندات' },
    { id: 4, date: '2024-06-15', roll: '12', type: 'جلسة حكم', decision: 'يحدد لاحقاً', status: 'upcoming', requirements: 'متابعة صدور الحكم واستخراج صورة رسمية منه' },
  ];

  const tasks = [
    { id: 1, title: 'استخراج صورة رسمية من المحضر', type: 'إداري - المحكمة', status: 'completed', date: '2024-02-01', assignee: 'مندوب المحكمة' },
    { id: 2, title: 'إعلان الخصوم وتصريح المحكمة', type: 'محضرين', status: 'completed', date: '2024-02-10', assignee: 'المحامي الميداني' },
    { id: 3, title: 'كتابة مذكرة الدفاع الختامية', type: 'صياغة قانونية', status: 'in-progress', date: '2024-05-05', assignee: 'محامي استئناف' },
    { id: 4, title: 'استخراج شهادة من الجدول', type: 'إداري - المحكمة', status: 'pending', date: '2024-06-20', assignee: 'مندوب المحكمة' },
  ];

  const documents = [
    { id: 1, title: 'صورة ضوئية من محضر الشرطة', type: 'محضر', date: '2024-01-10', size: '2.4 MB' },
    { id: 2, title: 'إعلان بالدعوى وتكليف بالحضور', type: 'إعلان', date: '2024-02-12', size: '1.1 MB' },
    { id: 3, title: 'مسودة مذكرة الدفاع', type: 'مذكرة قانونية', date: '2024-05-08', size: '500 KB' },
    { id: 4, title: 'حافظة مستندات (طية 3 مستندات)', type: 'حافظة مستندات', date: '2024-05-09', size: '4.5 MB' },
  ];

  const financials = [
    { id: 1, title: 'أتعاب مكتب (الدفعة المقدمة)', amount: 15000, type: 'income_fee', category: 'أتعاب محاماة', status: 'paid', date: '2024-01-05' },
    { id: 2, title: 'إيداع تحت حساب المصروفات والرسوم', amount: 2000, type: 'income_expense', category: 'أمانة مصروفات', status: 'paid', date: '2024-01-10' },
    { id: 3, title: 'مصاريف رسم دعوى ودمغات', amount: 350, type: 'expense', category: 'منصرف فعلي', status: 'paid', date: '2024-01-15' },
    { id: 4, title: 'رسم إنتقال محضرين', amount: 150, type: 'expense', category: 'منصرف فعلي', status: 'paid', date: '2024-02-05' },
    { id: 5, title: 'الدفعة الثانية من الأتعاب', amount: 5000, type: 'income_fee', category: 'أتعاب محاماة', status: 'pending', date: '2024-07-01' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 print:hidden">
        <Link to="/dashboard/cases" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة لقائمة القضايا
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{caseData.title}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {caseData.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                أرشيف المكتب: {caseData.internalId}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5"><FileSignature className="h-4 w-4" /> رقم القضية الحالي: {caseData.currentCaseNumber} لسنة {caseData.currentYear}</span>
              <span className="flex items-center gap-1.5"><Landmark className="h-4 w-4" /> {caseData.court}</span>
              <span className="flex items-center gap-1.5"><Scale className="h-4 w-4" /> {caseData.degree}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsPrintModalOpen(true)}>
              <Printer className="h-4 w-4" /> طباعة الملف
            </Button>
            <Button className="gap-2">
              <CalendarDays className="h-4 w-4" /> إضافة جلسة
            </Button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">صفتنا في الدعوى</p>
                        <p className="font-bold text-foreground mt-1">{caseData.clientRole}</p>
                    </div>
                    <Users className="h-8 w-8 text-indigo-500 opacity-20" />
                </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">الخصم</p>
                        <p className="font-bold text-foreground mt-1 line-clamp-1">{caseData.opponent}</p>
                    </div>
                    <Users className="h-8 w-8 text-rose-500 opacity-20" />
                </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">تاريخ الجلسة القادمة</p>
                        <p className="font-bold text-foreground mt-1 font-mono text-sm">{caseData.nextSession}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-blue-500 opacity-20" />
                </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">الدائرة</p>
                        <p className="font-bold text-foreground mt-1">{caseData.circuit}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-emerald-500 opacity-20" />
                </CardContent>
            </Card>
        </div>
      </div>



      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 border-b scrollbar-hide print:hidden">
        <div className="flex gap-2 whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 border-b-2 hover:bg-muted/50",
                activeTab === tab.id 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px] print:hidden">
        
        {/* TAB 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-semibold flex items-center gap-2 print:text-black">
              <History className="h-5 w-5 text-primary print:text-black" /> الخط الزمني لتطور الدعوى
            </h3>
            <div className="relative border-r-2 border-muted hover:border-primary/30 transition-colors mx-4 md:mx-6 space-y-8 pb-4 print:border-black">
              {sessions.map((session, index) => (
                <div key={index} className="relative pr-8 print:pr-4 print:pb-4">
                  <div className={cn(
                      "absolute -right-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-background flex items-center justify-center print:border-black print:border-2",
                      session.status === 'past' ? "bg-primary print:bg-black" : "bg-muted border-muted-foreground/30 print:bg-white"
                  )}>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-foreground print:text-black">{session.type}</span>
                      <span className="px-2 py-0.5 rounded-full bg-muted print:bg-transparent print:border print:border-black font-mono text-xs text-muted-foreground print:text-black">{session.date}</span>
                    </div>
                    <Card className="bg-card print:border-black print:shadow-none">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground print:text-gray-700">القرار / ما تم في الجلسة</p>
                          <p className="font-semibold mt-1 print:text-black">{session.decision}</p>
                        </div>
                        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/30 print:border-black print:bg-transparent">
                          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 print:text-black" />
                          <div>
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 print:text-black font-bold">الطلبات أو الإجراء المطلوب تنفيذه</p>
                            <p className="text-sm mt-0.5 text-foreground print:text-black">{session.requirements}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1.5: Litigation Degrees */}
        {activeTab === 'degrees' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between print:hidden">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> تسلسل درجات التقاضي للقضية
              </h3>
              <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> تصعيد لدرجة جديدة (استئناف/نقض)</Button>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg border flex items-center justify-between mb-4">
               <div>
                  <h4 className="font-bold">رقم الأرشيف المرجعي (ثابت): <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xl">{caseData.internalId}</span></h4>
                  <p className="text-sm text-muted-foreground mt-1">يُشير هذا الرقم لملف القضية الموحد الخاص بك، والذي يحتوي على كافة درجات التقاضي الخاصة بنفس الموضوع.</p>
               </div>
            </div>
            
            <div className="grid gap-4">
              {litigationDegrees.map((deg) => (
                <Card key={deg.id} className={cn(
                  "overflow-hidden transition-all print:border-2 print:border-black print:shadow-none",
                  deg.active ? "border-primary/50 shadow-md ring-1 ring-primary/20 scale-[1.01]" : ""
                )}>
                  <div className={cn(
                    "h-1.5 w-full print:hidden",
                    deg.active ? "bg-primary" : "bg-muted"
                  )} />
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       
                       <div className={cn(
                         "p-4 flex flex-col justify-center items-center text-center min-w-[140px] border-l",
                         deg.active ? "bg-primary/5 text-primary" : "bg-muted/30"
                       )}>
                         <Gavel className={cn("h-6 w-6 mb-2", deg.active ? "text-primary" : "text-muted-foreground")} />
                         <span className={cn("font-bold", deg.active ? "text-lg" : "")}>{deg.type}</span>
                         {deg.active && <span className="mt-1 px-2 py-0.5 rounded text-[10px] bg-primary text-primary-foreground font-bold">الدرجة الحالية</span>}
                       </div>

                       <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div className="space-y-1">
                             <p className="text-xs font-medium text-muted-foreground">رقم الدعوى والسنة</p>
                             <p className="font-bold text-lg font-mono" dir="ltr">{deg.caseNumber !== '-' ? `${deg.caseNumber} / ${deg.year}` : '-'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-medium text-muted-foreground">المحكمة المختصة</p>
                             <p className="font-semibold text-base">{deg.court}</p>
                          </div>
                          <div className="space-y-1 md:col-span-2 bg-muted/40 p-3 rounded-md">
                             <p className="text-xs font-medium text-muted-foreground">آخر حكم أو قرار في هذه الدرجة</p>
                             <p className="font-bold">{deg.result}</p>
                             {deg.date !== '-' && <p className="text-xs text-muted-foreground mt-1">تاريخ الحكم/القرار: {deg.date}</p>}
                             {deg.status === 'منتهية' && (
                               <div className="mt-3 flex gap-2">
                                 <Link to="/dashboard/execution">
                                   <Button size="sm" variant="outline" className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40 gap-1 shadow-sm font-bold">
                                     <Gavel className="h-3 w-3" /> استخراج صيغة تنفيذية وإحالة للتنفيذ
                                   </Button>
                                 </Link>
                               </div>
                             )}
                          </div>
                       </div>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> رول الجلسات وحضور المحامين
              </h3>
            </div>
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className={cn(
                  "overflow-hidden transition-all hover:shadow-md",
                  session.status === ' आगामी' ? "border-primary/50 shadow-sm" : ""
                )}>
                  <div className={cn(
                    "h-1 w-full",
                    session.status === 'past' ? "bg-muted" : "bg-primary"
                  )} />
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-2 min-w-[80px]">
                        <span className="text-sm font-semibold">{new Date(session.date).toLocaleDateString('ar-EG', { month: 'short' })}</span>
                        <span className="text-2xl font-bold font-mono">{new Date(session.date).getDate()}</span>
                        <span className="text-xs text-muted-foreground">{new Date(session.date).getFullYear()}</span>
                      </div>
                      
                      {/* Roll Number UI */}
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-2 min-w-[70px]">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">رقم الرول</span>
                        <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">{session.roll}</span>
                      </div>

                      <div className="space-y-1 mt-1">
                        <h4 className="font-bold text-lg">{session.type}</h4>
                        <p className="text-sm font-semibold mb-1">القرار: <span className="text-muted-foreground">{session.decision}</span></p>
                        {session.status === 'upcoming' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-900/40">
                            <Clock className="h-3 w-3" /> جلسة قادمة
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded border">المطلوب إنجازه: <span className="font-semibold text-foreground">{session.requirements}</span></p>
                      </div>
                    </div>
                    <div className="w-full md:w-auto bg-muted/40 p-3 rounded-md border min-w-[250px]">
                      <p className="text-xs font-medium text-muted-foreground mb-1">المحامي الحاضر / المطلوب</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">م</div>
                        <span className="text-sm font-medium">أستاذ / محمد الحسيني</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" /> الشغل الإداري والمهام المطلوبة من الفريق
              </h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> تكليف جديد</Button>
                <Link to="/dashboard/administrative">
                  <Button size="sm" className="gap-2 font-bold shadow-sm"><FolderOpen className="h-4 w-4" /> إدارة كافة المهام والمطبخ</Button>
                </Link>
              </div>
            </div>
            
            <Card>
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                     <th className="p-4 font-medium">حالة المهمة</th>
                     <th className="p-4 font-medium">وصف التكليف / الشغل الإداري</th>
                     <th className="p-4 font-medium">تاريخ الاستحقاق</th>
                     <th className="p-4 font-medium">المكلف بها</th>
                     <th className="p-4 font-medium">التصنيف</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        {task.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> مكتملة</span>
                        ) : task.status === 'in-progress' ? (
                          <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><Clock className="h-3.5 w-3.5" /> جاري العمل</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><AlertCircle className="h-3.5 w-3.5" /> معلقة</span>
                        )}
                      </td>
                      <td className="p-4 font-medium">{task.title}</td>
                      <td className="p-4 font-mono text-xs">{task.date}</td>
                      <td className="p-4 text-xs font-medium">{task.assignee}</td>
                      <td className="p-4 text-xs text-muted-foreground">{task.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: Documents */}
        {activeTab === 'docs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-primary" /> أرشيف المستندات والمذكرات المرتبطة
              </h3>
              <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> رفع مستند</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {documents.map(doc => (
                <Card key={doc.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-2" title={doc.title}>{doc.title}</h4>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded">{doc.type}</span>
                        <span className="font-mono">{doc.size}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Finance */}
        {activeTab === 'finance' && (
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
                         {financials.filter(f => f.type === 'income_fee' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span>
                       </p>
                    </CardContent>
                 </Card>
                 <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <CardContent className="p-4">
                       <p className="text-xs font-medium text-blue-800 dark:text-blue-400">أمانات مصروفات محصلة</p>
                       <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2 font-mono">
                         {financials.filter(f => f.type === 'income_expense' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span>
                       </p>
                    </CardContent>
                 </Card>
                 <Card className="bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
                    <CardContent className="p-4">
                       <p className="text-xs font-medium text-rose-800 dark:text-rose-400">إجمالي منصرف فعلي (رسوم)</p>
                       <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2 font-mono">
                         {financials.filter(f => f.type === 'expense' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span>
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
                    {financials.map(fin => (
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
        )}

      </div>

      {/* ----------------- PRINT LAYOUT (HIDDEN ON SCREEN) ----------------- */}
      <div className="hidden print:block w-full text-black bg-white select-text" dir="rtl">
        {printSections.cover && (
          <div className="mb-8 border-b-2 border-black pb-6 text-black break-after-auto">
            <div className="flex items-center justify-center mb-6 border-b border-gray-400 pb-4">
               <h1 className="text-3xl font-bold text-black border-2 border-black px-6 py-2 rounded-full uppercase tracking-widest whitespace-nowrap">غلاف تقرير ملف قضية</h1>
            </div>
            <div className="flex justify-between items-start mb-8 gap-6">
              <div className="flex-1 space-y-4">
                <div>
                   <p className="text-sm text-gray-600 font-bold mb-1">موضوع القضية</p>
                   <h2 className="text-2xl font-black text-black">{caseData.title}</h2>
                </div>
                <div>
                   <p className="text-lg font-bold text-black bg-gray-100 border border-black inline-block px-3 py-1 rounded shadow-sm">
                      رقم الأرشيف الداخلي למكتب: <span className="font-mono text-xl font-black tracking-wider text-indigo-900 mx-2">{caseData.internalId}</span>
                   </p>
                </div>
              </div>
              <div className="text-start border-2 border-black p-4 font-semibold text-lg text-black bg-gray-50 min-w-[280px] rounded-lg shadow-sm">
                <p className="border-b border-gray-300 pb-2 mb-2"><span className="text-gray-600 text-sm block">الجهة / التصنيف:</span> {caseData.jurisdiction}</p>
                <p className="border-b border-gray-300 pb-2 mb-2"><span className="text-gray-600 text-sm block">درجة التقاضي الحالية:</span> {caseData.degree}</p>
                <p className="border-b border-gray-300 pb-2 mb-2 font-mono text-xl font-bold" dir="rtl">رقم القضية: {caseData.currentCaseNumber} / {caseData.currentYear}</p>
                <p><span className="text-gray-600 text-sm block">المحكمة / الاستئنافية:</span> {caseData.court}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-lg border-2 border-black border-dashed p-5 font-semibold rounded text-black bg-white relative">
              <div className="absolute -top-3 right-6 bg-white px-2 text-sm font-bold text-gray-500">أطراف الخصومة</div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                 <p className="text-sm text-emerald-800 font-bold mb-1">صفتنا (المكتب) في الدعوى</p>
                 <p className="text-xl text-black font-black">{caseData.clientRole}</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded">
                 <p className="text-sm text-rose-800 font-bold mb-1">الخصم / الخصوم</p>
                 <p className="text-xl text-black font-black">{caseData.opponent}</p>
              </div>
            </div>
          </div>
        )}

        {printSections.degrees && (
          <div className="mb-8 page-break-inside-avoid">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> تسلسل ومسار درجات التقاضي
            </h3>
            <div className="space-y-3">
              {litigationDegrees.map(deg => (
                <div key={deg.id} className={cn("border p-3 flex justify-between bg-white text-black relative items-center", deg.active ? "border-2 border-black" : "border-gray-400 border-dashed")}>
                   {deg.active && <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-full bg-black rounded-l"></div>}
                   <div className="w-1/3">
                     <p className="font-bold text-lg">{deg.type}</p>
                     <p className="text-gray-700 font-mono font-semibold">رقم: {deg.caseNumber} / {deg.year}</p>
                   </div>
                   <div className="text-right w-1/3 border-r border-gray-300 pr-4">
                     <p className="font-semibold text-gray-800">الجهة:</p>
                     <p className="font-bold text-md">{deg.court}</p>
                   </div>
                   <div className="text-right w-1/3 border-r border-gray-300 pr-4">
                     <p className="font-semibold text-gray-800">القرار / الحكم:</p>
                     <p className="font-bold text-md text-black">{deg.result}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {printSections.timeline && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> الخط الزمني (سجل أحداث وسير الدعوى)
            </h3>
            <ul className="list-none space-y-4 font-medium text-black pr-2">
              {sessions.map(s => (
                <li key={s.id} className="border-r-4 border-gray-400 pr-4 py-1">
                   <div className="flex gap-2 items-baseline mb-1">
                     <span className="font-bold font-mono text-sm bg-gray-200 border border-gray-400 px-2 py-0.5 rounded shadow-sm">{s.date}</span>
                     <span className="font-black text-lg underline decoration-gray-400 underline-offset-4">{s.type}</span>
                   </div>
                   <p className="text-base text-gray-900 border-b border-gray-200 pb-2 inline-block">القرار: <strong className="font-black text-black">{s.decision}</strong></p>
                   <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded mt-2">
                     <span className="font-bold text-black border-l-2 border-gray-400 pl-2 ml-2">الإجراء المطلوب تنفيذه:</span> 
                     {s.requirements}
                   </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {printSections.sessions && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> كشف رول الجلسات المنعقدة والقادمة
            </h3>
            <table className="w-full border-collapse border-2 border-black text-right text-black text-sm">
              <thead>
                 <tr className="bg-gray-200 border-b-2 border-black">
                   <th className="border border-black p-3 font-bold w-32 text-center">التاريخ</th>
                   <th className="border border-black p-3 font-bold w-1/4">النوع / الوصف</th>
                   <th className="border border-black p-3 font-bold">القرار وما تم في الجلسة</th>
                 </tr>
              </thead>
              <tbody>
                 {sessions.map(s => (
                   <tr key={s.id} className="border-b border-black">
                      <td className="border border-black p-3 font-mono font-bold text-center bg-gray-50">{s.date}</td>
                      <td className="border border-black p-3 font-black text-base">{s.type}</td>
                      <td className="border border-black p-3 text-base font-semibold">{s.decision}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}

        {printSections.tasks && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> سجل التكليفات والمهام الإدارية
            </h3>
            <table className="w-full border-collapse border border-black text-right text-black text-sm">
              <thead>
                 <tr className="bg-gray-100 border-b border-black">
                   <th className="border border-black p-2 font-bold w-32 border-b-2">تاريخ التكليف</th>
                   <th className="border border-black p-2 font-bold border-b-2">تفاصيل وعنوان المهمة</th>
                   <th className="border border-black p-2 font-bold border-b-2">جهة الاختصاص / المكلف</th>
                 </tr>
              </thead>
              <tbody>
                 {tasks.map(t => (
                   <tr key={t.id} className="border-b border-gray-400">
                     <td className="border border-black p-2 font-mono font-semibold text-center">{t.date}</td>
                     <td className="border border-black p-2 font-bold text-base">{t.title}</td>
                     <td className="border border-black p-2 text-sm font-semibold text-gray-700">{t.assignee} ({t.type})</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}

        {printSections.docs && (
          <div className="mb-8">
             <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
               <span className="h-6 w-1 bg-black rounded-full block"></span> المرفقات وفهرس حافظة المستندات
             </h3>
             <table className="w-full border-collapse border border-black text-right text-black">
               <thead>
                 <tr className="bg-gray-100">
                   <th className="border border-black p-2 font-bold w-12 text-center">م</th>
                   <th className="border border-black p-2 font-bold w-1/4">نوع المستند</th>
                   <th className="border border-black p-2 font-bold">وصف / عنوان المستند</th>
                   <th className="border border-black p-2 font-bold w-32 text-center">تاريخ الإيداع</th>
                 </tr>
               </thead>
               <tbody>
                 {documents.map((d, index) => (
                   <tr key={d.id}>
                     <td className="border border-black p-2 text-center font-bold">{index + 1}</td>
                     <td className="border border-black p-2 font-bold text-gray-700">{d.type}</td>
                     <td className="border border-black p-2 font-semibold text-base">{d.title}</td>
                     <td className="border border-black p-2 font-mono text-sm text-center">{d.date}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {printSections.finance && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
               <span className="h-6 w-1 bg-black rounded-full block"></span> كشف الحساب والبيان المالي الخاص بالملف
            </h3>
            <table className="w-full border-collapse border-2 border-black text-right text-black text-sm mb-4">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-black">
                  <th className="border border-black p-3 font-bold w-32 text-center">تاريخ القيد</th>
                  <th className="border border-black p-3 font-bold text-center">المبلغ المستحق / المدفوع</th>
                  <th className="border border-black p-3 font-bold w-1/2">بيان الحركة / البند</th>
                  <th className="border border-black p-3 font-bold w-40">دائن / مدين (التصنيف)</th>
                </tr>
              </thead>
              <tbody>
                {financials.map(f => (
                  <tr key={f.id} className="border-b border-gray-400">
                    <td className="border border-black p-3 font-mono font-semibold text-center">{f.date}</td>
                    <td className="border border-black p-3 font-mono font-black text-lg text-center bg-gray-50">{f.amount.toLocaleString()} <span className="text-xs font-bold text-gray-600">ج.م</span></td>
                    <td className="border border-black p-3 font-bold text-base">{f.title}</td>
                    <td className="border border-black p-3 text-sm font-bold text-gray-700">
                       {f.type === 'income_fee' ? 'وارد - أتعاب' : f.type === 'income_expense' ? 'وارد - أمانة مصروفات' : 'منصرف - مصروفات ورسوم'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-4 print:page-break-inside-avoid">
               <div className="flex-[2] border-2 border-black p-3 text-center bg-gray-50">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 text-gray-700">إجمالي الأتعاب المحصلة</p>
                  <p className="font-mono text-2xl font-black">{financials.filter(f => f.type === 'income_fee' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
               <div className="flex-1 border-2 border-black p-3 text-center">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2">أمانات محصلة</p>
                  <p className="font-mono text-xl font-black">{financials.filter(f => f.type === 'income_expense' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
               <div className="flex-1 border-2 border-black p-3 text-center">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2">المنصرف الفعلي</p>
                  <p className="font-mono text-xl font-black">{financials.filter(f => f.type === 'expense' && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
               <div className="flex-1 border-2 border-black p-3 text-center bg-gray-200">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 text-gray-700">المتأخرات</p>
                  <p className="font-mono text-xl font-black">{financials.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
            </div>
          </div>
        )}

        {/* Footer/Sign-off for printed reports */}
        <div className="mt-16 pt-8 border-t-2 border-black text-center text-sm font-bold text-gray-500 page-break-inside-avoid">
           <p>نهاية المستخرج والمطبوع من منصة إدارة مكتب المحاماة.</p>
           <p className="mt-1 font-mono text-xs" dir="ltr">Printed on: {new Date().toLocaleDateString('ar-EG')} / Reference: {caseData.internalId}</p>
        </div>
      </div>

      {/* ----------------- PRINT OPTIONS MODAL ----------------- */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <Printer className="h-5 w-5 text-primary" /> خيارات طباعة الملف المقروء
               </h3>
               <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setIsPrintModalOpen(false)}>
                 <X className="h-4 w-4" />
               </Button>
            </div>
            <div className="p-5">
               <p className="text-sm font-semibold text-muted-foreground mb-4 border-r-2 border-primary pr-2">حدد محتويات وأجزاء ملف القضية المراد إدراجها في التقرير المطبوع:</p>
               <div className="space-y-2">
                 {[
                   { key: 'cover', label: 'البيانات الأساسية وغلاف الملف (ديباجة)' },
                   { key: 'degrees', label: 'تسلسل درجات التقاضي' },
                   { key: 'timeline', label: 'الخط الزمني (طابور سير الدعوى)' },
                   { key: 'sessions', label: 'أجندة رول الجلسات المنعقدة' },
                   { key: 'tasks', label: 'المهام الإدارية ومتطلبات القضية' },
                   { key: 'docs', label: 'فهرس المرفقات وحوافظ المستندات' },
                   { key: 'finance', label: 'كشف الحساب المالي (رسوم وأتعاب)' },
                 ].map(opt => (
                    <label key={opt.key} className="flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-all select-none">
                       <span className={cn("text-sm transition-colors", printSections[opt.key as keyof typeof printSections] ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>{opt.label}</span>
                       <div 
                         className={cn("h-5 w-5 rounded border flex items-center justify-center transition-all shadow-sm ring-offset-background", printSections[opt.key as keyof typeof printSections] ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background opacity-60")}
                         onClick={(e) => { e.preventDefault(); togglePrintSection(opt.key as keyof typeof printSections); }}
                       >
                         {printSections[opt.key as keyof typeof printSections] && <Check className="h-3.5 w-3.5" />}
                       </div>
                    </label>
                 ))}
               </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-muted/20">
               <Button type="button" variant="outline" className="font-semibold" onClick={() => setIsPrintModalOpen(false)}>إلغاء النافذة</Button>
               <Button type="button" onClick={handlePrint} className="gap-2 font-bold shadow-md"><Printer className="h-4 w-4" /> تأكيد الطباعة</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
