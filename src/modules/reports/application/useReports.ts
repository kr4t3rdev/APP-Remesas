import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { queryKeys } from '../../../shared/query/queryKeys';
import { reportsRepository } from '../infrastructure/reports.repository';

export const useReportsDailyReportQuery = (date: Date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');

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
