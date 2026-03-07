import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/query/queryKeys';
import type { CreatePlanInput } from '../../../types';
import { plansRepository } from '../infrastructure/plans.repository';

export const usePlansCatalogQuery = () =>
  useQuery({
    queryKey: queryKeys.plans.catalog(),
    queryFn: plansRepository.getAll,
    staleTime: 1000 * 60,
  });

export const useCreatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlanInput) => plansRepository.create(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.plans.catalog() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.plans.list() }),
      ]);
    },
  });
};

export const useUpdatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; data: Partial<CreatePlanInput> }) => plansRepository.update(input.id, input.data),
    onSuccess: async (_updated, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.plans.catalog() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.plans.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.plans.detail(variables.id) }),
      ]);
    },
  });
};
