import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/query/queryKeys';
import { exchangeRatesRepository } from '../infrastructure/exchange-rates.repository';

export const useCurrenciesQuery = () =>
  useQuery({
    queryKey: queryKeys.exchangeRates.currencies(),
    queryFn: exchangeRatesRepository.getCurrencies,
    staleTime: 1000 * 60 * 30,
  });

export const useCurrentExchangeRatesQuery = () =>
  useQuery({
    queryKey: queryKeys.exchangeRates.current(),
    queryFn: exchangeRatesRepository.getExchangeRates,
    staleTime: 1000 * 60 * 5,
  });

export const useRateHistoryQuery = (currencyId?: number) =>
  useQuery({
    queryKey: queryKeys.exchangeRates.history(currencyId),
    queryFn: () => exchangeRatesRepository.getRateHistory(currencyId),
    staleTime: 1000 * 60 * 2,
  });

export const useUpdateExchangeRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      currencyId: number;
      data: { referenceRate: number; buyMargin: number; sellMargin: number };
    }) => exchangeRatesRepository.updateExchangeRate(payload.currencyId, payload.data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['exchangeRates'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
};
