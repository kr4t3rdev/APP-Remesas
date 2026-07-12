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
    initialData: [],
  });

export const useExpenseDetailQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => expensesRepository.getExpenseById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

export const usePendingExpensesQuery = () =>
  useQuery({
    queryKey: queryKeys.expenses.pending(),
    queryFn: () => expensesRepository.getPendingExpenses(),
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    initialData: [],
  });

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      expensesRepository.createExpense(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.pending(),
        }),
      ]);
    },
  });
};

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; data: UpdateExpenseInput }) =>
      expensesRepository.updateExpense(input.id, input.data),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.pending(),
        }),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.pending(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.detail(id),
        }),
      ]);
    },
  });
};
