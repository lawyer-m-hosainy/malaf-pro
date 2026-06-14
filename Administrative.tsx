import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderOpen, Calendar, Clock, CheckCircle2, User, AlertCircle, MapPin, Link as LinkIcon, FileText, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Mock data for administrative tasks
const initialTasks = [
  { id: 'T-001', caseId: 'C-2024-001', caseTitle: 'جناية تزوير - النيل للتجارة', internalId: '125/2024', title: 'تصوير ملف القضية كامل من المحكمة', type: 'إداري (نيابات ومحاكم)', priority: 'high', status: 'pending', assignee: 'أحمد (المندوب)', dueDate: '2024-06-15', location: 'محكمة استئناف القاهرة' },
  { id: 'T-002', caseId: 'C-2024-003', caseTitle: 'طعن ضريبي - مؤسسة الأهرام', internalId: '127/2024', title: 'استخراج شهادة من الجدول بحصول استئناف', type: 'إداري (نيابات ومحاكم)', priority: 'medium', status: 'in-progress', assignee: 'أحمد (المندوب)', dueDate: '2024-06-14', location: 'مجلس الدولة' },
  { id: 'T-003', caseId: 'C-2024-002', caseTitle: 'نزاع علامة تجارية', internalId: '126/2024', title: 'كتابة مذكرة الدفاع الختامية', type: 'صياغة قانونية', priority: 'high', status: 'in-progress', assignee: 'أ. محمد الحسيني', dueDate: '2024-06-18', location: 'المكتب' },
  { id: 'T-004', caseId: 'C-2024-004', caseTitle: 'إخلاء لعدم سداد الأجرة', internalId: '15/2022', title: 'إعلان بالسند التنفيذي (تكليف بالوفاء)', type: 'محضرين وإعلانات', priority: 'high', status: 'completed', assignee: 'محامي الإعلانات', dueDate: '2024-05-20', location: 'قلم المحضرين' },
  { id: 'T-005', caseId: 'C-2024-001', caseTitle: 'جناية تزوير - النيل للتجارة', internalId: '125/2024', title: 'استخراج تصريح من المحكمة لجهة الإدارة', type: 'إداري (نيابات ومحاكم)', priority: 'medium', status: 'pending', assignee: 'أحمد (المندوب)', dueDate: '2024-06-20', location: 'محكمة استئناف القاهرة' },
  { id: 'T-006', caseId: 'C-2024-002', caseTitle: 'نزاع علامة تجارية', internalId: '126/2024', title: 'حضور جلسة الخبراء وتقديم حافظة المستندات', type: 'خبراء', priority: 'high', status: 'pending', assignee: 'محامي ابتدائي', dueDate: '2024-06-22', location: 'مكتب الخبراء المتخصص' },
];

import { useAuthStore } from '@/store/useAuthStore';

export default function Administrative() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [filterType, setFilterType] = useState('الجميع');
  const [assigneeFilter, setAssigneeFilter] = useState('الجميع');
  const [dateFilter, setDateFilter] = useState('الجميع');

  // get unique assignees for the filter
  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee)));

  const filteredTasks = tasks.filter(t => {
    // Role-based access simulation
    if (user?.role === 'lawyer' && t.assignee !== user.name) {
      return false;
    }

    const matchesSearch = t.title.includes(searchQuery) || t.caseTitle.includes(searchQuery) || t.assignee.includes(searchQuery);
    const matchesType = filterType === 'الجميع' ? true : t.type === filterType;
    const matchesAssignee = assigneeFilter === 'الجميع' ? true : t.assignee === assigneeFilter;
    
    let matchesDate = true;
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0,0,0,0);
    
    if (dateFilter === 'today') {
      matchesDate = dueDate.getTime() === today.getTime();
    } else if (dateFilter === 'thisWeek') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      matchesDate = dueDate >= today && dueDate <= nextWeek;
    } else if (dateFilter === 'overdue') {
      matchesDate = dueDate < today && t.status !== 'completed';
    }
    
    return matchesSearch && matchesType && matchesAssignee && matchesDate;
  });

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/40';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/40';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/40';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'عاجل وهام';
      case 'medium': return 'متوسط';
      case 'low': return 'عادي';
      default: return priority;
    }
  };

  // Group columns for Kanban
  const renderKanbanColumn = (statusKey: string, title: string, bgClass: string, headerClass: string) => {
    const columnTasks = filteredTasks.filter(t => t.status === statusKey);
    return (
      <div className={cn("flex flex-col rounded-xl border bg-muted/20 h-[calc(100vh-280px)] min-h-[500px]", bgClass)}>
        <div className={cn("p-4 border-b font-bold flex items-center justify-between", headerClass)}>
          <span className="flex items-center gap-2">
            {statusKey === 'pending' && <AlertCircle className="h-5 w-5" />}
            {statusKey === 'in-progress' && <Clock className="h-5 w-5" />}
            {statusKey === 'completed' && <CheckCircle2 className="h-5 w-5" />}
            {title}
          </span>
          <span className="text-xs bg-background/50 px-2 py-1 rounded-full text-foreground">{columnTasks.length} مهام</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {columnTasks.map(task => (
            <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", getPriorityColors(task.priority))}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{task.type}</span>
                </div>
                <h4 className="font-bold text-sm mb-2 leading-tight">{task.title}</h4>
                
                <Link to={`/dashboard/cases/${task.caseId}`} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 truncate">
                  <LinkIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{task.caseTitle}</span>
                  <span className="font-mono bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded text-[10px]">({task.internalId})</span>
                </Link>

                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignee}</span>
                    <span className="flex items-center gap-1 font-mono text-[10px]"><Calendar className="h-3 w-3" /> {task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" /> <span className="truncate">{task.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {columnTasks.length === 0 && (
            <div className="text-center p-6 text-muted-foreground text-sm flex flex-col items-center">
              <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
              لا توجد مهام في هذه القائمة
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">الشغل الإداري</h2>
          <p className="text-sm text-muted-foreground mt-1 print:hidden">أكثر من 70% من نجاح القضايا يعتمد على الشغل الإداري والمتابعة الدقيقة للطلبات والمهام.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> تكليف بمهمة جديدة
            </Button>
          )}
        </div>
      </div>

      <Card className="print:shadow-none print:border-none print:m-0">
        <CardHeader className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div className="flex flex-1 w-full gap-4 items-center flex-wrap">
             <div className="relative w-full md:max-w-xs">
               <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="بحث بتفاصيل المهمة، المندوب، أو القضية..." 
                 className="pr-10"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
             </div>
             <select 
                className="h-10 rounded-md border border-input bg-background text-sm px-3 hidden md:block"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="الجميع">جميع أنواع المهام</option>
                <option value="إداري (نيابات ومحاكم)">إداري (نيابات ومحاكم)</option>
                <option value="صياغة قانونية">صياغة قانونية (مذكرات)</option>
                <option value="محضرين وإعلانات">محضرين وإعلانات</option>
                <option value="خبراء">مأموريات خبراء</option>
                <option value="أخرى">أخرى / عامة</option>
             </select>
             {user?.role !== 'lawyer' && (
               <select 
                  className="h-10 rounded-md border border-input bg-background text-sm px-3 hidden md:block"
                  value={assigneeFilter}
                  onChange={e => setAssigneeFilter(e.target.value)}
                >
                  <option value="الجميع">جميع المندوبين والمحامين</option>
                  {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
               </select>
             )}
             <select 
                className="h-10 rounded-md border border-input bg-background text-sm px-3 hidden md:block"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              >
                <option value="الجميع">تاريخ الاستحقاق (الجميع)</option>
                <option value="today">اليوم</option>
                <option value="thisWeek">هذا الأسبوع</option>
                <option value="overdue">متأخرة</option>
             </select>
          </div>
          
          <div className="flex rounded-md border bg-muted/50 p-1">
             <button 
               className={cn("px-4 py-1.5 text-sm font-semibold rounded-sm transition-all", activeTab === 'board' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
               onClick={() => setActiveTab('board')}
             >
                لوحة المتابعة (Kanban)
             </button>
             <button 
               className={cn("px-4 py-1.5 text-sm font-semibold rounded-sm transition-all", activeTab === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
               onClick={() => setActiveTab('list')}
             >
                جدول المهام
             </button>
          </div>
        </CardHeader>

        {activeTab === 'board' ? (
          <CardContent className="p-4 pt-6 overflow-x-auto print:p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[900px]">
              {renderKanbanColumn('pending', 'مهام معلقة / مطلوبة', 'border-slate-200 dark:border-slate-800', 'bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800')}
              {renderKanbanColumn('in-progress', 'جاري العمل ومتابعتها', 'border-blue-200 dark:border-blue-900', 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-900')}
              {renderKanbanColumn('completed', 'مهام مكتملة ومنتهية', 'border-emerald-200 dark:border-emerald-900', 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900')}
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-0 overflow-x-auto">
             <table className="w-full text-sm text-right">
               <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                     <th className="p-4 font-medium">البيان وحالة المهمة</th>
                     <th className="p-4 font-medium">الارتباط بالقضية (الأرشيف)</th>
                     <th className="p-4 font-medium">الاختصاصات</th>
                     <th className="p-4 font-medium">الجهة / المكان</th>
                     <th className="p-4 font-medium">تاريخ الاستحقاق</th>
                     <th className="p-4 font-medium text-center print:hidden">إجراءات</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredTasks.map(item => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                       <td className="p-4">
                          <div className="flex items-start gap-3">
                             <div className="shrink-0 mt-1 print:hidden">
                               {item.status === 'pending' && <AlertCircle className="h-4 w-4 text-slate-500" />}
                               {item.status === 'in-progress' && <Clock className="h-4 w-4 text-blue-500" />}
                               {item.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                             </div>
                             <div className="flex flex-col">
                               <span className="font-bold text-base print:text-sm">{item.title}</span>
                               <span className={cn("text-[10px] items-center gap-1 mt-1 font-bold px-2 py-0.5 rounded w-fit print:border print:text-black", getPriorityColors(item.priority))}>
                                 {getPriorityLabel(item.priority)}
                               </span>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                         <div className="flex flex-col gap-1.5">
                           <Link to={`/dashboard/cases/${item.caseId}`} className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1 group print:text-black print:no-underline">
                              <LinkIcon className="h-3 w-3 group-hover:rotate-45 transition-transform print:hidden" />
                              {item.caseTitle}
                           </Link>
                           <span className="text-xs text-muted-foreground print:text-black">
                             مكتب: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold print:text-black">{item.internalId}</span>
                           </span>
                         </div>
                       </td>
                       <td className="p-4">
                          <div className="flex flex-col gap-1 text-xs">
                             <span className="bg-muted px-2 py-1 rounded w-fit print:border print:bg-transparent">{item.type}</span>
                             <span className="flex items-center gap-1 text-muted-foreground mt-1 font-medium print:text-black"><User className="h-3 w-3 print:hidden" /> {item.assignee}</span>
                          </div>
                       </td>
                       <td className="p-4 text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-2 print:text-black">
                          <MapPin className="h-3 w-3 shrink-0 print:hidden" /> {item.location}
                       </td>
                       <td className="p-4">
                          <span className="font-mono text-xs print:text-black">{item.dueDate}</span>
                       </td>
                       <td className="p-4 text-center print:hidden">
                         <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1 bg-background hover:bg-muted" onClick={() => window.print()}>
                           <FileText className="h-3 w-3" /> التفاصيل
                         </Button>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
