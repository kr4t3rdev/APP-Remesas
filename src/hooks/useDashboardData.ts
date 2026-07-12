import { useQuery } from "@tanstack/react-query";
import type {
  DailyReport,
  CashBalance,
  Transaction,
  ExchangeRate,
  Expense,
  Objective,
} from "../types";
import { queryKeys } from "../shared/query/queryKeys";
import { dashboardRepository } from "../modules/dashboard/infrastructure/dashboard.repository";
import { safeArray, safePath } from "../services/api-response";

export const useDailyReport = (date?: string) => {
  return useQuery<DailyReport, Error>({
    queryKey: queryKeys.dashboard.dailyReport(date),
    queryFn: () => dashboardRepository.getDailyReport(date),
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  });
};

export const useCashBalances = () => {
  return useQuery<CashBalance[], Error>({
    queryKey: queryKeys.dashboard.cashBalances(),
    queryFn: dashboardRepository.getCashBalances,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    initialData: [],
  });
};

export const useExchangeRates = () => {
  return useQuery<ExchangeRate[], Error>({
    queryKey: queryKeys.dashboard.exchangeRates(),
    queryFn: dashboardRepository.getExchangeRates,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
    initialData: [],
  });
};

export const useRecentTransactions = (limit?: number) => {
  return useQuery<Transaction[], Error>({
    queryKey: queryKeys.dashboard.recentTransactions(limit),
    queryFn: () => dashboardRepository.getTransactions(),
    initialData: [],
    select: (data) => {
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return limit ? sorted.slice(0, limit) : sorted;
    },
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
  });
};

export const usePendingTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: queryKeys.dashboard.pendingTransactions(),
    queryFn: dashboardRepository.getPendingTransactions,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    initialData: [],
  });
};

export const useRecentExpenses = (limit?: number) => {
  return useQuery<Expense[], Error>({
    queryKey: queryKeys.dashboard.recentExpenses(limit),
    queryFn: () => dashboardRepository.getExpenses(),
    initialData: [],
    select: (data) => {
      const sorted = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      return limit ? sorted.slice(0, limit) : sorted;
    },
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
  });
};

export const useActiveObjectives = () => {
  return useQuery<Objective[], Error>({
    queryKey: queryKeys.dashboard.activeObjectives(),
    queryFn: () => dashboardRepository.getObjectives("ACTIVO"),
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
    initialData: [],
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

  const isRefreshing = dailyReport.isFetching && !dailyReport.isLoading;

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

  const totalCashBalance =
    safeArray(cashBalances.data).reduce((sum, b) => {
      const rate = safeArray(exchangeRates.data).find(
        (r) => r.currencyId === b.currencyId,
      );
      const cupValue = rate ? b.balance * rate.sellRate : b.balance;
      return sum + cupValue;
    }, 0) || 0;

  const todayProfit = safePath<number>(dailyReport.data, "profit.net", 0) || 0;
  const todayTransactions = safePath<number>(dailyReport.data, "transactions.total", 0) || 0;
  const todayExpenses = safePath<number>(dailyReport.data, "expenses.totalAmount", 0) || 0;

  const transactionSummary = {
    compras: safePath<number>(dailyReport.data, "transactions.totalCompras", 0) || 0,
    ventas: safePath<number>(dailyReport.data, "transactions.totalVentas", 0) || 0,
    comprasCount: safePath<number>(dailyReport.data, "transactions.compras", 0) || 0,
    ventasCount: safePath<number>(dailyReport.data, "transactions.ventas", 0) || 0,
  };

  const expensesByCategory = safePath<Record<string, number>>(
    dailyReport.data,
    "expenses.byCategory",
    {},
  ) || {};

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
