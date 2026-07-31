import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { expensesRepository } from "../infrastructure/expenses.repository";
import type { CreateExpenseInput, UpdateExpenseInput } from "../../../types";

export const useExpensesQuery = (params?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  currencyId?: number;
  page?: number;
  pageSize?: number;
}) =>
  useInfiniteQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: ({ pageParam }) => expensesRepository.getExpenses({ ...params, page: pageParam, pageSize: 50 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    placeholderData: keepPreviousData,
    select: (data) => data.pages.flatMap((page) => page.items),
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
    queryClient.invalidateQueries({ queryKey: ["expenses"] }),
    queryClient.invalidateQueries({ queryKey: ["cash"] }),
    queryClient.invalidateQueries({ queryKey: ["bankAccounts"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["profile"] }),
    queryClient.invalidateQueries({ queryKey: ["reports"] }),
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
    onMutate: (id) => {
      const cached = queryClient.getQueryData<{ sourceBankAccountId?: number }>(queryKeys.expenses.detail(id));
      return { sourceBankAccountId: cached?.sourceBankAccountId };
    },
    onSuccess: async (_data, id, context) => {
      await Promise.all([
        ...invalidateBalanceQueries(queryClient, context?.sourceBankAccountId),
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.detail(id),
        }),
      ]);
    },
  });
};
