import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CASE_STATUS_LABELS,
  SESSION_TYPE_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  INVOICE_STATUS_LABELS,
} from '@/lib/labels';

export function useCaseDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'timeline' | 'degrees' | 'deadlines' | 'sessions' | 'tasks' | 'docs' | 'finance'>('timeline');
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

  const { data: raw, isLoading, isError } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const res = await api.get(`/cases/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const caseData = raw ? {
    id: raw.id,
    internalId: raw.internalId,
    currentCaseNumber: raw.caseNumber,
    currentYear: raw.year,
    title: raw.title,
    jurisdiction: raw.jurisdiction,
    degree: raw.degree,
    court: raw.jurisdiction,
    circuit: raw.branch,
    clientRole: raw.clientRole,
    opponent: raw.opponent,
    status: raw.status,
    statusLabel: CASE_STATUS_LABELS[raw.status] || raw.status,
    nextSession: raw.nextSession ? new Date(raw.nextSession).toLocaleDateString('ar-EG') : 'يحدد لاحقاً',
    clientId: raw.clientId,
    clientName: raw.client?.name || 'غير محدد',
    clientPhone: raw.client?.phone || '',
    lawyerName: raw.assignedLawyer?.name || 'غير معين',
  } : null;

  const litigationDegrees = (raw?.lineage || []).map((d: any) => ({
    id: d.id,
    degree: d.degree,
    jurisdiction: d.jurisdiction,
    branch: d.branch,
    caseNumber: d.caseNumber,
    year: d.year,
    status: d.status,
    statusLabel: CASE_STATUS_LABELS[d.status] || d.status,
    isCurrent: d.id === raw?.id,
  }));

  const sessions = (raw?.sessions || []).map((s: any) => ({
    id: s.id,
    date: s.date,
    typeLabel: SESSION_TYPE_LABELS[s.type] || s.type,
    result: s.result || 'لم يتم تسجيل نتيجة بعد',
    nextSessionDate: s.nextSessionDate,
    notes: s.notes,
    lawyerName: s.lawyer?.name,
    isUpcoming: new Date(s.date).getTime() >= new Date().setHours(0, 0, 0, 0),
  }));

  const tasks = (raw?.tasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    statusLabel: TASK_STATUS_LABELS[t.status] || t.status,
    priority: t.priority,
    priorityLabel: TASK_PRIORITY_LABELS[t.priority] || t.priority,
    dueDate: t.dueDate,
    assigneeName: t.assignee?.name || 'غير معين',
  }));

  const documents = (raw?.documents || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    createdAt: d.createdAt,
  }));

  const caseUpdates = (raw?.caseUpdates || []).map((u: any) => ({
    id: u.id,
    action: u.action,
    details: u.details,
    createdAt: u.createdAt,
  }));

  const invoices = (raw?.invoices || []).map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    totalAmount: Number(inv.totalAmount),
    status: inv.status,
    statusLabel: INVOICE_STATUS_LABELS[inv.status] || inv.status,
    issueDate: inv.issueDate,
  }));

  return {
    state: {
      activeTab,
      isPrintModalOpen,
      printSections,
      isLoading,
      isError,
    },
    data: {
      caseData,
      litigationDegrees,
      sessions,
      tasks,
      documents,
      caseUpdates,
      invoices,
    },
    handlers: {
      setActiveTab,
      setIsPrintModalOpen,
      handlePrint,
      togglePrintSection
    }
  };
}
