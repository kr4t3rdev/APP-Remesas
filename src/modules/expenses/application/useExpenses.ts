import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { expensesRepository } from "../infrastructure/expenses.repository";
import type { CreateExpenseInput, UpdateExpenseInput } from "../../../types";

export const useExpensesQuery = (params?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  currencyId?: number;
}) =>
  useQuery({
    queryKey: queryKeys.expenses.list(),
    queryFn: () => expensesRepository.getExpenses(params),
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    placeholderData: [],
  });

export const useExpenseDetailQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => expensesRepository.getExpenseById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });


const invalidateBalanceQueries = (queryClient: ReturnType<typeof useQueryClient>, sourceBankAccountId?: number) => {
  const invalidations: ReturnType<typeof queryClient.invalidateQueries>[] = [
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.cash.balances() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.list() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cashBalances() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.cashBalances() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.cashBalances() }),
  ];
  if (sourceBankAccountId !== undefined) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.balance(sourceBankAccountId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.detail(sourceBankAccountId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.transactions(sourceBankAccountId),
      }),
    );
  }
  return invalidations;
};

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      expensesRepository.createExpense(data),
    onSuccess: async (_expense, variables) => {
      await Promise.all(
        invalidateBalanceQueries(
          queryClient,
          variables.sourceBankAccountId ?? undefined,
        ),
      );
    },
  });
};

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; data: UpdateExpenseInput }) =>
      expensesRepository.updateExpense(input.id, input.data),
    onSuccess: async (_data, variables) => {
      const sourceBankAccountId =
        variables.data.sourceBankAccountId ?? undefined;
      await Promise.all([
        ...invalidateBalanceQueries(queryClient, sourceBankAccountId),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => expensesRepository.deleteExpense(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        ...invalidateBalanceQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.detail(id),
        }),
      ]);
    },
  });
};
