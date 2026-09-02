import { History, Scale, CalendarDays, CheckSquare, FileArchive, Wallet, Loader2, AlertTriangle, ArrowRight, AlarmClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCaseDetails } from './useCaseDetails';
import { CaseHeader } from './CaseHeader';
import { CaseInfo } from './CaseInfo';
import { CaseTimeline } from './CaseTimeline';
import { CaseDegrees } from './CaseDegrees';
import { CaseDeadlines } from './CaseDeadlines';
import { CaseSessions } from './CaseSessions';
import { CaseTasks } from './CaseTasks';
import { CaseDocuments } from './CaseDocuments';
import { CaseFinance } from './CaseFinance';
import { PrintModal } from './PrintModal';
import { PrintLayout } from './PrintLayout';

export default function CaseDetails() {
  const { data, handlers, state } = useCaseDetails();

  const tabs = [
    { id: 'timeline', label: 'الخط الزمني (سير الدعوى)', icon: History },
    { id: 'degrees', label: 'درجة التقاضي', icon: Scale },
    { id: 'deadlines', label: 'المواعيد الحتمية', icon: AlarmClock },
    { id: 'sessions', label: 'أجندة الجلسات', icon: CalendarDays },
    { id: 'tasks', label: 'المهام ومتابعة الشغل', icon: CheckSquare },
    { id: 'docs', label: 'المستندات والمذكرات', icon: FileArchive },
    { id: 'finance', label: 'الفواتير والأتعاب', icon: Wallet },
  ];

  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>جاري تحميل بيانات القضية...</p>
      </div>
    );
  }

  if (state.isError || !data.caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="font-semibold">تعذر العثور على القضية أو حدث خطأ في تحميلها</p>
        <Link to="/dashboard/cases" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
          <ArrowRight className="h-4 w-4 ml-1" /> العودة لقائمة القضايا
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">

      <CaseHeader caseData={data.caseData} handlers={handlers} />
      <CaseInfo caseData={data.caseData} />

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 border-b scrollbar-hide print:hidden">
        <div className="flex gap-2 whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handlers.setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 border-b-2 hover:bg-muted/50",
                state.activeTab === tab.id
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
        {state.activeTab === 'timeline' && <CaseTimeline caseUpdates={data.caseUpdates} />}
        {state.activeTab === 'degrees' && <CaseDegrees caseData={data.caseData} litigationDegrees={data.litigationDegrees} />}
        {state.activeTab === 'deadlines' && <CaseDeadlines caseId={data.caseData.id} />}
        {state.activeTab === 'sessions' && <CaseSessions sessions={data.sessions} />}
        {state.activeTab === 'tasks' && <CaseTasks tasks={data.tasks} />}
        {state.activeTab === 'docs' && <CaseDocuments caseId={data.caseData.id} />}
        {state.activeTab === 'finance' && <CaseFinance invoices={data.invoices} />}
      </div>

      {/* Print Layout */}
      <PrintLayout {...data} printSections={state.printSections} />

      {/* Print Modal */}
      <PrintModal state={state} handlers={handlers} />

    </div>
  );
}
