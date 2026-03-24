import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { bankAccountsRepository } from "../infrastructure/bankAccounts.repository";

export const useBankAccountsQuery = () =>
  useQuery({
    queryKey: queryKeys.bankAccounts.list(),
    queryFn: bankAccountsRepository.getAll,
    staleTime: 1000 * 60 * 5,
  });

export const useBankAccountQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.bankAccounts.detail(id),
    queryFn: () => bankAccountsRepository.getOne(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useBankAccountBalanceQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.bankAccounts.balance(id),
    queryFn: () => bankAccountsRepository.getBalance(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useBankAccountTransactionsQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.bankAccounts.transactions(id),
    queryFn: () => bankAccountsRepository.getTransactions(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateBankAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      bankName: string;
      currencyId: number;
      accountNumber: string;
      initialBalance?: number;
      isActive?: boolean;
    }) => bankAccountsRepository.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.list(),
      });
    },
  });
};

export const useUpdateBankAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        bankName?: string;
        currencyId?: number;
        accountNumber?: string;
        isActive?: boolean;
      };
    }) => bankAccountsRepository.update(id, data),
    onSuccess: async (_, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.bankAccounts.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.bankAccounts.detail(id),
        }),
      ]);
    },
  });
};

export const useDeleteBankAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bankAccountsRepository.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bankAccounts.list(),
      });
    },
  });
};
