import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useReportsData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get('/dashboard/reports');
      return res.data;
    }
  });

  const emptyStats = {
    totalCases: 0,
    openCases: 0,
    closedCases: 0,
    pendingCases: 0,
    casesByJurisdiction: {},
    totalClients: 0,
    totalIncome: 0,
    totalPending: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByMonth: [],
    topClients: [],
  };

  return { ...(data || emptyStats), isLoading, error };
}
