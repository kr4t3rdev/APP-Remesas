import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import type { BillingCycle } from "../../../types";
import { subscriptionsRepository } from "../infrastructure/subscriptions.repository";

export const useSubscriptionLicensesQuery = (userId?: number) =>
  useQuery({
    queryKey: queryKeys.subscriptions.userLicenses(userId),
    queryFn: () => subscriptionsRepository.getLicenses(userId),
    staleTime: 1000 * 60 * 2,
  });

export const useAssignLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: number;
      planId: number;
      cycle: BillingCycle;
      state?: string;
      expiresAt?: string;
      reason?: string;
    }) => subscriptionsRepository.assignLicense(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.list(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.userLicenses(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() });
    },
  });
};

export const useRenewLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; planId: number; cycle: BillingCycle }) =>
      subscriptionsRepository.renewLicense(data.id, {
        planId: data.planId,
        cycle: data.cycle,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.userLicenses(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() });
    },
  });
};

export const useSuspendLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; reason?: string }) =>
      subscriptionsRepository.suspendLicense(data.id, data.reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.userLicenses(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() });
    },
  });
};

export const useReactivateLicenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; reason?: string }) =>
      subscriptionsRepository.reactivateLicense(data.id, data.reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.userLicenses(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() });
    },
  });
};

export const useRegisterSubscriptionPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: number;
      userLicenseId?: number;
      planId: number;
      cycle: BillingCycle;
      amountUsd: number;
      exchangeRateUsed: number;
      bankAccountId?: number;
      paidAt?: string;
      notes?: string;
    }) => subscriptionsRepository.registerPayment(data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.subscriptions.userLicenses(variables.userId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.subscriptions.payments(variables.userId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.bankAccounts.list(),
        }),
      ]);
    },
  });
};
