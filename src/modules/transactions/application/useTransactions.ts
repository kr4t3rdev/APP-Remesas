import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TransactionType } from '../../../types';
import { queryKeys } from '../../../shared/query/queryKeys';
import { transactionsRepository } from '../infrastructure/transactions.repository';

export const useTransactionsQuery = (params?: { type?: TransactionType; status?: 'PENDIENTE' | 'RECONCILIADO'; startDate?: string; endDate?: string }) =>
  useQuery({
    queryKey: ['transactions', 'list', params],
    queryFn: () => transactionsRepository.getTransactions(params),
    staleTime: 1000 * 60 * 2,
  });

export const useCurrenciesQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions.currencies(),
    queryFn: transactionsRepository.getCurrencies,
    staleTime: 1000 * 60 * 30,
  });

export const useExchangeRatesQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions.exchangeRates(),
    queryFn: transactionsRepository.getExchangeRates,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsRepository.createTransaction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
};
