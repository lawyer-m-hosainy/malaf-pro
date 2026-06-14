import { useState } from 'react';
import { useParams } from 'react-router-dom';

export function useCaseDetails() {
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

  return {
    state: {
      activeTab,
      isPrintModalOpen,
      printSections,
    },
    data: {
      caseData,
      litigationDegrees,
      sessions,
      tasks,
      documents,
      financials
    },
    handlers: {
      setActiveTab,
      setIsPrintModalOpen,
      handlePrint,
      togglePrintSection
    }
  };
}
