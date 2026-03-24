import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reconciliationsRepository } from "../infrastructure/reconciliations.repository";
import { queryKeys } from "../../../shared/query/queryKeys";
import type {
  ReconcileExpenseRequest,
  ReconcileIncomeRequest,
  ReconcileIncomeBulkRequest,
} from "../../../types";

export const useReconciliationsQuery = () =>
  useQuery({
    queryKey: queryKeys.reconciliations.list(),
    queryFn: reconciliationsRepository.getAll,
  });

export const useReconciliationDetailQuery = (
  id: number,
  type: "expense" | "income",
) =>
  useQuery({
    queryKey: queryKeys.reconciliations.detail(id, type),
    queryFn: () => reconciliationsRepository.getOne(id, type),
    enabled: !!id,
  });

export const useReconcileExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReconcileExpenseRequest) =>
      reconciliationsRepository.reconcileExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reconciliations.list(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pending() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.dailyReport(),
      });
    },
  });
};

export const useReconcileIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReconcileIncomeRequest) =>
      reconciliationsRepository.reconcileIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reconciliations.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.dailyReport(),
      });
    },
  });
};

export const useReconcileIncomeBulkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReconcileIncomeBulkRequest) =>
      reconciliationsRepository.reconcileIncomeBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reconciliations.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.dailyReport(),
      });
    },
  });
};
