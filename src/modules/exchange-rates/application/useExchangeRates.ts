import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/query/queryKeys';
import { exchangeRatesRepository } from '../infrastructure/exchange-rates.repository';
import type { CreateRateHistoryInput } from '../../../types';

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

export const useAllExchangeRatesQuery = () =>
  useQuery({
    queryKey: queryKeys.exchangeRates.all(),
    queryFn: exchangeRatesRepository.getAllRates,
    staleTime: 1000 * 60 * 5,
  });

export const useExchangeRatesByCurrencyQuery = (currencyId: number) =>
  useQuery({
    queryKey: queryKeys.exchangeRates.byCurrency(currencyId),
    queryFn: () => exchangeRatesRepository.getRatesByCurrency(currencyId),
    staleTime: 1000 * 60 * 5,
    enabled: !!currencyId,
  });

export const useRateHistoryQuery = (currencyId?: number) =>
  useQuery({
    queryKey: queryKeys.exchangeRates.history(currencyId),
    queryFn: () => exchangeRatesRepository.getRateHistory(currencyId),
    staleTime: 1000 * 60 * 2,
  });

export const useManualRatesQuery = () =>
  useQuery({
    queryKey: queryKeys.exchangeRates.manualRates(),
    queryFn: exchangeRatesRepository.getManualRates,
    staleTime: 1000 * 60 * 5,
  });

export const usePairHistoryQuery = (fromId: number, toId: number) =>
  useQuery({
    queryKey: queryKeys.exchangeRates.pairHistory(fromId, toId),
    queryFn: () => exchangeRatesRepository.getPairHistory(fromId, toId),
    staleTime: 1000 * 60 * 5,
    enabled: !!fromId && !!toId,
  });

export const usePairStatsQuery = (fromId: number, toId: number) =>
  useQuery({
    queryKey: queryKeys.exchangeRates.pairStats(fromId, toId),
    queryFn: () => exchangeRatesRepository.getPairStats(fromId, toId),
    staleTime: 1000 * 60 * 5,
    enabled: !!fromId && !!toId,
  });

export const useLatestRateQuery = (fromId: number, toId: number) =>
  useQuery({
    queryKey: queryKeys.exchangeRates.latestRate(fromId, toId),
    queryFn: () => exchangeRatesRepository.getLatestRate(fromId, toId),
    staleTime: 1000 * 60 * 2,
    enabled: !!fromId && !!toId,
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

export const useCreateRateHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRateHistoryInput) => exchangeRatesRepository.createRateHistory(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.exchangeRates.history(undefined) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.exchangeRates.manualRates() }),
      ]);
    },
  });
};
