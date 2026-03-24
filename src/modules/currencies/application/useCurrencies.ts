import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { currenciesRepository } from "../infrastructure/currencies.repository";

export const useCurrenciesQuery = () =>
  useQuery({
    queryKey: queryKeys.currencies.list(),
    queryFn: currenciesRepository.getAll,
    staleTime: 1000 * 60 * 30,
  });

export const useCurrenciesWithPrimaryQuery = () =>
  useQuery({
    queryKey: queryKeys.currencies.withPrimary(),
    queryFn: currenciesRepository.getWithPrimary,
    staleTime: 1000 * 60 * 10,
  });

export const useCreateCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      symbol: string;
      isActive?: boolean;
    }) => currenciesRepository.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.currencies.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.currencies.withPrimary(),
        }),
      ]);
    },
  });
};

export const useUpdateCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        code?: string;
        name?: string;
        symbol?: string;
        isActive?: boolean;
      };
    }) => currenciesRepository.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.currencies.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.currencies.withPrimary(),
        }),
      ]);
    },
  });
};

export const useSetPrimaryCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (primaryCurrencyId: number) =>
      currenciesRepository.setPrimaryCurrency(primaryCurrencyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.currencies.withPrimary(),
      });
    },
  });
};

export const useCurrencyDetailQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.currencies.detail(id),
    queryFn: () => currenciesRepository.getById(id),
    staleTime: 1000 * 60 * 10,
    enabled: !!id,
  });

export const useDeleteCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => currenciesRepository.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.currencies.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.currencies.withPrimary(),
        }),
      ]);
    },
  });
};
