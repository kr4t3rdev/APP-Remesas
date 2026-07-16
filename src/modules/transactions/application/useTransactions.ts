import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionType } from "../../../types";
import { queryKeys } from "../../../shared/query/queryKeys";
import { transactionsRepository } from "../infrastructure/transactions.repository";

export const useTransactionsQuery = (params?: {
  type?: TransactionType;
  status?: "PENDIENTE" | "RECONCILIADO";
  startDate?: string;
  endDate?: string;
}) =>
  useQuery({
    queryKey: queryKeys.transactions.list(params?.type),
    queryFn: () => transactionsRepository.getTransactions(params),
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    initialData: [],
    initialDataUpdatedAt: 0,
  });

export const useCurrenciesQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions.currencies(),
    queryFn: transactionsRepository.getCurrencies,
    staleTime: 1000 * 60 * 30,
    throwOnError: false,
    initialData: [],
    initialDataUpdatedAt: 0,
  });

export const useExchangeRatesQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions.exchangeRates(),
    queryFn: transactionsRepository.getExchangeRates,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
    initialData: [],
    initialDataUpdatedAt: 0,
  });

export const usePositionsQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions.positions(),
    queryFn: transactionsRepository.getPositions,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    initialData: [],
    initialDataUpdatedAt: 0,
  });

export const useRemittancesQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions.remittances(),
    queryFn: transactionsRepository.getRemittances,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    initialData: [],
  });

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsRepository.createTransaction,
    onSuccess: async (_response, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["cash"] }),
        queryClient.invalidateQueries({ queryKey: ["bankAccounts"] }),
      ];
      if (variables.persistRate) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["exchangeRates"] }),
          queryClient.invalidateQueries({ queryKey: queryKeys.transactions.exchangeRates() }),
        );
      }
      await Promise.all(invalidations);
    },
  });
};
