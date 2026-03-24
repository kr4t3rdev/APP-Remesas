import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryKeys } from "../../../shared/query/queryKeys";
import { reportsRepository } from "../infrastructure/reports.repository";

export const useReportsDailyReportQuery = (date: Date) => {
  const formattedDate = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: queryKeys.reports.dailyReport(formattedDate),
    queryFn: () => reportsRepository.getDailyReport(formattedDate),
    staleTime: 1000 * 60 * 2,
  });
};

export const useReportsCashBalancesQuery = () =>
  useQuery({
    queryKey: queryKeys.reports.cashBalances(),
    queryFn: reportsRepository.getCashBalances,
    staleTime: 1000 * 60 * 2,
  });

export const useReportsPeriodQuery = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: queryKeys.reports.periodReport(startDate, endDate),
    queryFn: () => reportsRepository.getPeriodReport(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!startDate && !!endDate,
  });

export const useReportsProfitQuery = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: queryKeys.reports.profitReport(startDate, endDate),
    queryFn: () => reportsRepository.getProfitReport(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!startDate && !!endDate,
  });

export const useReportsCurrencyQuery = (
  currencyId: number,
  startDate?: string,
  endDate?: string,
) =>
  useQuery({
    queryKey: queryKeys.reports.currencyReport(currencyId, startDate, endDate),
    queryFn: () =>
      reportsRepository.getCurrencyReport(currencyId, startDate, endDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!currencyId,
  });

export const useReportsExpensesQuery = (
  startDate?: string,
  endDate?: string,
  category?: string,
) =>
  useQuery({
    queryKey: queryKeys.reports.expensesReport(startDate, endDate, category),
    queryFn: () =>
      reportsRepository.getExpensesReport(startDate, endDate, category),
    staleTime: 1000 * 60 * 5,
  });

export const useReportsAccountsQuery = () =>
  useQuery({
    queryKey: queryKeys.reports.accountsReport(),
    queryFn: reportsRepository.getAccountsReport,
    staleTime: 1000 * 60 * 5,
  });

export const useReportsObjectivesQuery = () =>
  useQuery({
    queryKey: queryKeys.reports.objectivesReport(),
    queryFn: reportsRepository.getObjectivesReport,
    staleTime: 1000 * 60 * 5,
  });

export const useReportsCashFlowQuery = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: queryKeys.reports.cashFlowReport(startDate, endDate),
    queryFn: () => reportsRepository.getCashFlowReport(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!startDate && !!endDate,
  });

export const useReportsAuditSummaryQuery = (
  startDate?: string,
  endDate?: string,
) =>
  useQuery({
    queryKey: queryKeys.reports.auditSummary(startDate, endDate),
    queryFn: () => reportsRepository.getAuditSummary(startDate, endDate),
    staleTime: 1000 * 60 * 5,
  });
