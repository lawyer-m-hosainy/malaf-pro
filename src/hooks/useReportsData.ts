import { useMemo } from 'react';
import { useLocalStore } from '@/store/useLocalStore';

export function useReportsData() {
  const cases = useLocalStore(state => state.cases);
  const clients = useLocalStore(state => state.clients);
  const finance = useLocalStore(state => state.finance);

  const stats = useMemo(() => {
    // ── إحصائيات القضايا ──
    const totalCases = cases.length;
    const openCases = cases.filter(c => ['متداولة', 'مفتوحة', 'بالخبراء'].includes(c.status)).length;
    const closedCases = cases.filter(c => c.status === 'منتهية').length;
    const pendingCases = cases.filter(c => c.status === 'محجوزة للحكم').length;

    // توزيع القضايا حسب النوع (للـ Pie chart)
    const casesByJurisdiction = cases.reduce((acc, c) => {
      acc[c.jurisdiction] = (acc[c.jurisdiction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // ── إحصائيات الموكلين ──
    const totalClients = clients.length;

    // ── إحصائيات المالية ──
    const totalIncome = finance
      .filter(f => ['income_fee', 'income_expense'].includes(f.type) && f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);

    const totalPending = finance
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0);

    const totalExpenses = finance
      .filter(f => f.type === 'expense' && f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    // الإيرادات حسب الشهر (للـ Bar chart)
    const incomeByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleString('ar-EG', { month: 'short' });
      
      const monthIncome = finance
        .filter(f => {
          const fDate = new Date(f.date);
          return (
            fDate.getMonth() === date.getMonth() &&
            fDate.getFullYear() === date.getFullYear() &&
            ['income_fee', 'income_expense'].includes(f.type) &&
            f.status === 'paid'
          );
        })
        .reduce((sum, f) => sum + f.amount, 0);
        
      return { name: monthName, إيرادات: monthIncome };
    });

    // أكثر 5 موكلين من حيث عدد القضايا
    const topClients = clients
      .map(client => ({
        name: client.name,
        cases: cases.filter(c => c.clientName === client.name).length,
      }))
      .filter(c => c.cases > 0)
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5);

    return {
      totalCases,
      openCases,
      closedCases,
      pendingCases,
      casesByJurisdiction,
      totalClients,
      totalIncome,
      totalPending,
      totalExpenses,
      netProfit,
      incomeByMonth,
      topClients,
    };
  }, [cases, clients, finance]);

  return stats;
}
