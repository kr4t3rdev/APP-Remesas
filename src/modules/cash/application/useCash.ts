import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CashAdjustmentType } from '../../../types';
import { queryKeys } from '../../../shared/query/queryKeys';
import { cashRepository } from '../infrastructure/cash.repository';

export const useCashBalancesQuery = () =>
  useQuery({
    queryKey: queryKeys.cash.balances(),
    queryFn: cashRepository.getCashBalances,
    staleTime: 1000 * 60 * 2,
  });

export const useCashTransactionsQuery = () =>
  useQuery({
    queryKey: queryKeys.cash.transactions(),
    queryFn: cashRepository.getTransactions,
    staleTime: 1000 * 60 * 2,
  });

export const useCashAuditsQuery = (currencyId?: number) =>
  useQuery({
    queryKey: queryKeys.cash.audits(currencyId),
    queryFn: () => cashRepository.getCashAudits(currencyId),
    staleTime: 1000 * 60 * 2,
  });

export const useCashAdjustmentsQuery = (currencyId?: number) =>
  useQuery({
    queryKey: queryKeys.cash.adjustments(currencyId),
    queryFn: () => cashRepository.getCashAdjustments(currencyId),
    staleTime: 1000 * 60 * 2,
  });

export const useCreateCashAuditMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cashRepository.createCashAudit,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cash'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
};

export const useCreateCashAdjustmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      currencyId: number;
      amount: number;
      type: CashAdjustmentType;
      reason: string;
    }) => cashRepository.createCashAdjustment(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cash'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
};
