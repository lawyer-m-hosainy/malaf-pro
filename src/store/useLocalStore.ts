import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Case, Client, FinanceItem } from '@/types';

const initialCasesList: Case[] = [
  { id: 'C-2024-001', internalId: '125/2024', year: '2024', caseNumber: '1540', jurisdiction: 'القضاء العادي', branch: 'القضاء الجنائي', degree: 'جنايات مستأنفة', title: 'جناية تزوير - النيل للتجارة', clientName: 'شركة النيل للتجارة', clientRole: 'متهم', opponent: 'النيابة العامة', status: 'متداولة', nextSession: '2026-07-15' },
  { id: 'C-2024-002', internalId: '126/2024', year: '2023', caseNumber: '980', jurisdiction: 'المحاكم الاقتصادية', branch: 'مدني وتجاري اقتصادي', degree: 'اقتصادي ابتدائي', title: 'نزاع علامة تجارية', clientName: 'مؤسسة الأفق للبرمجيات', clientRole: 'المدعى عليه', opponent: 'شركة المنافس', status: 'محجوزة للحكم', nextSession: '2026-06-25' },
  { id: 'C-2024-003', internalId: '127/2024', year: '2024', caseNumber: '4509', jurisdiction: 'مجلس الدولة', branch: 'القضاء الإداري', degree: 'محكمة القضاء الإداري', title: 'طعن ضريبي - مؤسسة الأهرام', clientName: 'مؤسسة الأهرام للطباعة', clientRole: 'المدعي', opponent: 'وزير المالية (بصفته)', status: 'بالخبراء', nextSession: '2026-06-30' },
  { id: 'C-2024-004', internalId: '15/2022', year: '2022', caseNumber: '211', jurisdiction: 'القضاء العادي', branch: 'القضاء المدني والتجاري', degree: 'استئناف عالي', title: 'إخلاء لعدم سداد الأجرة', clientName: 'ورثة الحاج سعيد', clientRole: 'المدعي (المالك)', opponent: 'يوسف المستأجر', status: 'منتهية', nextSession: '-' },
];

const initialClients: Client[] = [
  { id: '1', name: 'شركة النيل للتجارة', type: 'شخص اعتباري', nationality: 'مصري', identityLabel: 'سجل تجاري', identityNumber: '12345-67', phone: '01012345678', email: 'info@niletrade.com', cases: 3 },
  { id: '2', name: 'أحمد محمود سليمان', type: 'شخص طبيعي', nationality: 'مصري', identityLabel: 'رقم قومي', identityNumber: '29001011234567', phone: '01123456789', email: 'ahmed.m@email.com', cases: 1 },
  { id: '3', name: 'مؤسسة الأهرام للمقاولات', type: 'شخص اعتباري', nationality: 'كيان أجنبي', identityLabel: 'سجل تجاري أجنبي', identityNumber: 'UAE-998877', phone: '+971501234567', email: 'legal@ahram.com', cases: 5 },
  { id: '4', name: 'ياسر فاروق عبد الرحمن', type: 'شخص طبيعي', nationality: 'مصري', identityLabel: 'رقم قومي', identityNumber: '28505051234567', phone: '01111223344', email: 'yasser.f@email.com', cases: 0 },
  { id: '5', name: 'جون دو (John Doe)', type: 'شخص طبيعي', nationality: 'أجنبي', identityLabel: 'جواز سفر', identityNumber: 'US-987654321', phone: '+1234567890', email: 'john.doe@email.com', cases: 2 },
];

const initialFinance: FinanceItem[] = [
  { id: 'FIN-1001', caseId: 'C-2024-001', client: 'شركة النيل للتجارة', amount: 15000, type: 'income_fee', category: 'أتعاب مكتب', date: '2024-06-01', status: 'paid', note: 'دفعة مقدمة من الأتعاب المتفق عليها' },
  { id: 'FIN-1002', caseId: 'C-2024-001', client: 'شركة النيل للتجارة', amount: 2000, type: 'income_expense', category: 'أمانة مصروفات', date: '2024-06-05', status: 'paid', note: 'مبلغ تحت حساب مصروفات القضية والرسوم' },
  { id: 'FIN-1003', caseId: 'C-2024-001', client: 'شركة النيل للتجارة', amount: 350, type: 'expense', category: 'منصرف فعلي', date: '2024-06-10', status: 'paid', note: 'رسوم تصوير ملف القضية واستخراج شهادات' },
  { id: 'FIN-1004', caseId: 'C-2024-002', client: 'مؤسسة الأفق للبرمجيات', amount: 5000, type: 'income_fee', category: 'أتعاب مكتب', date: '2024-06-25', status: 'pending', note: 'الدفعة الثانية من الأتعاب (مستحقة)' },
];

interface LocalStore {
  cases: Case[];
  clients: Client[];
  finance: FinanceItem[];
  addCase: (c: Case) => void;
  updateCase: (id: string, data: Partial<Case>) => void;
  removeCase: (id: string) => void;
  addClient: (c: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;
  addFinance: (f: FinanceItem) => void;
  updateFinance: (id: string, data: Partial<FinanceItem>) => void;
  removeFinance: (id: string) => void;
}

export const useLocalStore = create<LocalStore>()(
  persist(
    (set) => ({
      cases: initialCasesList,
      clients: initialClients,
      finance: initialFinance,
      addCase: (c) => set((state) => ({ cases: [c, ...state.cases] })),
      updateCase: (id, data) => set((state) => ({ cases: state.cases.map(c => c.id === id ? { ...c, ...data } : c) })),
      removeCase: (id) => set((state) => ({ cases: state.cases.filter(c => c.id !== id) })),
      
      addClient: (c) => set((state) => ({ clients: [c, ...state.clients] })),
      updateClient: (id, data) => set((state) => ({ clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c) })),
      removeClient: (id) => set((state) => ({ clients: state.clients.filter(c => c.id !== id) })),
      
      addFinance: (f) => set((state) => ({ finance: [f, ...state.finance] })),
      updateFinance: (id, data) => set((state) => ({ finance: state.finance.map(f => f.id === id ? { ...f, ...data } : f) })),
      removeFinance: (id) => set((state) => ({ finance: state.finance.filter(f => f.id !== id) })),
    }),
    {
      name: 'malaf-local-storage',
    }
  )
);
