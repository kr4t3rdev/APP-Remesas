import { useQuery } from '@tanstack/react-query';
import type { DailyReport, CashBalance, Transaction, ExchangeRate, Expense, Objective } from '../types';
import { queryKeys } from '../shared/query/queryKeys';
import { dashboardRepository } from '../modules/dashboard/infrastructure/dashboard.repository';

export const useDailyReport = (date?: string) => {
  return useQuery<DailyReport>({
    queryKey: queryKeys.dashboard.dailyReport(date),
    queryFn: () => dashboardRepository.getDailyReport(date),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCashBalances = () => {
  return useQuery<CashBalance[]>({
    queryKey: queryKeys.dashboard.cashBalances(),
    queryFn: dashboardRepository.getCashBalances,
    staleTime: 1000 * 60 * 2,
  });
};

export const useExchangeRates = () => {
  return useQuery<ExchangeRate[]>({
    queryKey: queryKeys.dashboard.exchangeRates(),
    queryFn: dashboardRepository.getExchangeRates,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentTransactions = (limit?: number) => {
  return useQuery<Transaction[]>({
    queryKey: queryKeys.dashboard.recentTransactions(limit),
    queryFn: () => dashboardRepository.getTransactions(),
    select: (data) => {
      const sorted = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return limit ? sorted.slice(0, limit) : sorted;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const usePendingTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: queryKeys.dashboard.pendingTransactions(),
    queryFn: dashboardRepository.getPendingTransactions,
    staleTime: 1000 * 60 * 2,
  });
};

export const useRecentExpenses = (limit?: number) => {
  return useQuery<Expense[]>({
    queryKey: queryKeys.dashboard.recentExpenses(limit),
    queryFn: () => dashboardRepository.getExpenses(),
    select: (data) => {
      const sorted = [...data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return limit ? sorted.slice(0, limit) : sorted;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useActiveObjectives = () => {
  return useQuery<Objective[]>({
    queryKey: queryKeys.dashboard.activeObjectives(),
    queryFn: () => dashboardRepository.getObjectives('ACTIVO'),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDashboardData = () => {
  const dailyReport = useDailyReport();
  const cashBalances = useCashBalances();
  const exchangeRates = useExchangeRates();
  const recentTransactions = useRecentTransactions(5);
  const pendingTransactions = usePendingTransactions();
  const activeObjectives = useActiveObjectives();

  const isLoading = 
    dailyReport.isLoading || 
    cashBalances.isLoading || 
    exchangeRates.isLoading ||
    recentTransactions.isLoading;

  const isRefreshing = 
    dailyReport.isFetching && !dailyReport.isLoading;

  const refetchAll = async () => {
    await Promise.all([
      dailyReport.refetch(),
      cashBalances.refetch(),
      exchangeRates.refetch(),
      recentTransactions.refetch(),
      pendingTransactions.refetch(),
      activeObjectives.refetch(),
    ]);
  };

  const totalCashBalance = cashBalances.data?.reduce((sum, b) => {
    const rate = exchangeRates.data?.find(r => r.currencyId === b.currencyId);
    const cupValue = rate ? b.balance * rate.sellRate : b.balance;
    return sum + cupValue;
  }, 0) || 0;

  const todayProfit = dailyReport.data?.profit.net || 0;
  const todayTransactions = dailyReport.data?.transactions.total || 0;
  const todayExpenses = dailyReport.data?.expenses.totalAmount || 0;

  const transactionSummary = {
    compras: dailyReport.data?.transactions.totalCompras || 0,
    ventas: dailyReport.data?.transactions.totalVentas || 0,
    comprasCount: dailyReport.data?.transactions.compras || 0,
    ventasCount: dailyReport.data?.transactions.ventas || 0,
  };

  const expensesByCategory = dailyReport.data?.expenses.byCategory || {};

  return {
    dailyReport: dailyReport.data,
    cashBalances: cashBalances.data,
    exchangeRates: exchangeRates.data,
    recentTransactions: recentTransactions.data,
    pendingTransactions: pendingTransactions.data,
    activeObjectives: activeObjectives.data,
    isLoading,
    isRefreshing,
    refetchAll,
    summary: {
      totalCashBalance,
      todayProfit,
      todayTransactions,
      todayExpenses,
      transactionSummary,
      expensesByCategory,
    },
  };
};
