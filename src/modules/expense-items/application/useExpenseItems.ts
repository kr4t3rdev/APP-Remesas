import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateExpenseItemInput,
  UpdateExpenseItemInput,
  ExpenseReport,
  ReportPeriod,
} from '../../../types';
import { queryKeys } from '../../../shared/query/queryKeys';
import { expenseItemsRepository } from '../infrastructure/expense-items.repository';

export const useExpenseItemsQuery = (params?: {
  category?: string;
  startDate?: string;
  endDate?: string;
}) =>
  useQuery({
    queryKey: queryKeys.expenseItems.all(params),
    queryFn: () => expenseItemsRepository.getExpenseItems(params),
    staleTime: 1000 * 60 * 2,
  });

export const useExpenseItemQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.expenseItems.byId(id),
    queryFn: () => expenseItemsRepository.getExpenseItemById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: queryKeys.expenseItems.categories(),
    queryFn: expenseItemsRepository.getCategories,
    staleTime: 1000 * 60 * 10,
  });

export const useExpenseReportQuery = (period: ReportPeriod, date?: string) =>
  useQuery({
    queryKey: queryKeys.expenseItems.report(period, date),
    queryFn: () => expenseItemsRepository.getExpenseReport(period, date),
    staleTime: 1000 * 60 * 2,
    enabled: !!period,
  });

export const useCreateExpenseItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseItemsRepository.createExpenseItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.expenseItems.root() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.expenseItems.categoriesRoot() }),
      ]);
    },
  });
};

export const useUpdateExpenseItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseItemInput }) =>
      expenseItemsRepository.updateExpenseItem(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenseItems.root() });
    },
  });
};

export const useDeleteExpenseItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseItemsRepository.deleteExpenseItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenseItems.root() });
    },
  });
};
