import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/query/queryKeys';
import { workerPaymentsRepository } from '../infrastructure/workerPayments.repository';
import type {
  Worker,
  CreateWorkerInput,
  UpdateWorkerInput,
  CreateTransactionInput,
  AddBalanceInput,
} from '../../../types';

export const useWorkersQuery = () =>
  useQuery({
    queryKey: queryKeys.workerPayments.list(),
    queryFn: () => workerPaymentsRepository.getWorkers(),
    staleTime: 1000 * 60 * 2,
  });

export const useWorkerDetailQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.workerPayments.detail(id),
    queryFn: () => workerPaymentsRepository.getWorkerById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

export const useCreateWorkerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkerInput) => workerPaymentsRepository.createWorker(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.list() });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.detail(variables.id) }),
      ]);
    },
  });
};

export const useDeleteWorkerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => workerPaymentsRepository.deleteWorker(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.list() });
    },
  });
};

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workerId, input }: { workerId: number; input: Omit<CreateTransactionInput, 'workerId'> }) =>
      workerPaymentsRepository.createTransaction(workerId, input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.detail(variables.workerId) }),
      ]);
    },
  });
};

export const useAddBalanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workerId, amount }: { workerId: number; amount: number }) =>
      workerPaymentsRepository.addBalance(workerId, amount),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workerPayments.detail(variables.workerId) }),
      ]);
    },
  });
};
