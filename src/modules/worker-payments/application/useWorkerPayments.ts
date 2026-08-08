import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { workerPaymentsRepository } from "../infrastructure/workerPayments.repository";
import type {
  Worker,
  CreateWorkerInput,
  UpdateWorkerInput,
} from "../../../types";

export const useWorkersQuery = () =>
  useQuery({
    queryKey: queryKeys.workerPayments.list(),
    queryFn: () => workerPaymentsRepository.getWorkers(),
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
    placeholderData: [],
  });

export const useWorkerDetailQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.workerPayments.detail(id),
    queryFn: () => workerPaymentsRepository.getWorkerById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
    throwOnError: false,
  });

export const useCreateWorkerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkerInput) =>
      workerPaymentsRepository.createWorker(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.workerPayments.list(),
      });
    },
  });
};

export const useUpdateWorkerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateWorkerInput }) =>
      workerPaymentsRepository.updateWorker(id, input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.workerPayments.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workerPayments.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useDeleteWorkerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => workerPaymentsRepository.deleteWorker(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.workerPayments.list(),
      });
    },
  });
};

export const useAddBalanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workerId,
      amount,
      sourceType,
      sourceId,
      currencyId,
    }: {
      workerId: number;
      amount: number;
      sourceType?: "CASH" | "BANK_ACCOUNT";
      sourceId?: number;
      currencyId?: number;
    }) => workerPaymentsRepository.addBalance(workerId, { amount, sourceType, sourceId, currencyId }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.workerPayments.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workerPayments.detail(variables.workerId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.cash.balances() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.list() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.positions() }),
      ]);
    },
  });
};

export const useDepositMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workerId,
      amount,
      destinationType,
      destinationId,
      currencyId,
    }: {
      workerId: number;
      amount: number;
      destinationType?: "CASH" | "BANK_ACCOUNT";
      destinationId?: number;
      currencyId?: number;
    }) => workerPaymentsRepository.deposit(workerId, { amount, destinationType, destinationId, currencyId }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.workerPayments.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workerPayments.detail(variables.workerId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.cash.balances() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.list() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.positions() }),
      ]);
    },
  });
};
