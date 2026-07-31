import { useQuery } from "@tanstack/react-query";
import type {
  DailyReport,
  CashBalance,
  Transaction,
  ExchangeRate,
  Expense,
  Objective,
} from "../types";
import type { FxPerformanceReport } from "../types/business";
import { queryKeys } from "../shared/query/queryKeys";
import { dashboardRepository } from "../modules/dashboard/infrastructure/dashboard.repository";
import { safeArray, safePath } from "../services/api-response";
import { useCurrenciesWithPrimaryQuery } from "../modules/currencies/application/useCurrencies";

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
    placeholderData: [],
  });
};

export const useExchangeRates = () => {
  return useQuery<ExchangeRate[], Error>({
    queryKey: queryKeys.dashboard.exchangeRates(),
    queryFn: dashboardRepository.getExchangeRates,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
    placeholderData: [],
  });
};

export const useRecentTransactions = (limit?: number) => {
  return useQuery<Transaction[], Error>({
    queryKey: queryKeys.dashboard.recentTransactions(limit),
    queryFn: () => dashboardRepository.getTransactions(),
    placeholderData: [],
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

export const useRecentExpenses = (limit?: number) => {
  return useQuery<Expense[], Error>({
    queryKey: queryKeys.dashboard.recentExpenses(limit),
    queryFn: () => dashboardRepository.getExpenses(),
    placeholderData: [],
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
    placeholderData: [],
  });
};

export const useDashboardData = () => {
  const dailyReport = useDailyReport();
  const cashBalances = useCashBalances();
  const exchangeRates = useExchangeRates();
  const recentTransactions = useRecentTransactions(5);
  const activeObjectives = useActiveObjectives();
  const fxPerformance = useQuery<FxPerformanceReport, Error>({
    queryKey: queryKeys.dashboard.fxPerformance(),
    queryFn: dashboardRepository.getFxPerformance,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
  });
  const currenciesWithPrimary = useCurrenciesWithPrimaryQuery();
  const primaryCurrency = currenciesWithPrimary.data?.currencies.find(
    (currency) => currency.id === currenciesWithPrimary.data?.primaryCurrencyId,
  ) ?? null;

  const isLoading =
    dailyReport.isLoading ||
    cashBalances.isLoading ||
    exchangeRates.isLoading ||
    recentTransactions.isLoading ||
    activeObjectives.isLoading ||
    fxPerformance.isLoading ||
    currenciesWithPrimary.isLoading;

  const isRefreshing =
    (dailyReport.isFetching && !dailyReport.isLoading) ||
    (cashBalances.isFetching && !cashBalances.isLoading) ||
    (exchangeRates.isFetching && !exchangeRates.isLoading) ||
    (recentTransactions.isFetching && !recentTransactions.isLoading) ||
    (activeObjectives.isFetching && !activeObjectives.isLoading) ||
    (fxPerformance.isFetching && !fxPerformance.isLoading) ||
    (currenciesWithPrimary.isFetching && !currenciesWithPrimary.isLoading);

  const refetchAll = async () => {
    await Promise.all([
      dailyReport.refetch(),
      cashBalances.refetch(),
      exchangeRates.refetch(),
      recentTransactions.refetch(),
      activeObjectives.refetch(),
      fxPerformance.refetch(),
      currenciesWithPrimary.refetch(),
    ]);
  };

  const cashBalancesData = safeArray(cashBalances.data);
  const exchangeRatesData = safeArray(exchangeRates.data);
  const totalCashBalance = primaryCurrency && cashBalancesData.every((balance) => {
    const isPrimary = balance.currencyId === primaryCurrency.id;
    return isPrimary || exchangeRatesData.some((rate) => rate.currencyId === balance.currencyId);
  })
    ? cashBalancesData.reduce((sum, balance) => {
        if (balance.currencyId === primaryCurrency.id) return sum + balance.balance;
        const rate = exchangeRatesData.find((item) => item.currencyId === balance.currencyId);
        return sum + (rate ? balance.balance * rate.sellRate : 0);
      }, 0)
    : null;

  const hasUnconvertedExpenses = (safePath<number>(dailyReport.data, "expenses.unconvertedCount", 0) ?? 0) > 0;
  const todayProfit = hasUnconvertedExpenses
    ? null
    : safePath<number>(dailyReport.data, "profit.net", 0) || 0;
  const todayTransactions = safePath<number>(dailyReport.data, "transactions.total", 0) || 0;
  const todayExpenses = safePath<number | null>(dailyReport.data, "expenses.totalAmountInCup", null);

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
    activeObjectives: activeObjectives.data,
    fxPerformance: fxPerformance.data,
    isLoading,
    isRefreshing,
    refetchAll,
    summary: {
      totalCashBalance,
      primaryCurrency,
      todayProfit,
      todayTransactions,
      todayExpenses,
      transactionSummary,
      expensesByCategory,
    },
  };
};
