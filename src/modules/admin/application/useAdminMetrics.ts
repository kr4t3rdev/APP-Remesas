import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminCreateUserRequest, AdminUserControlRequest } from '../../../types';
import { queryKeys } from '../../../shared/query/queryKeys';
import { adminRepository } from '../infrastructure/admin.repository';

export const useAdminKpisQuery = (params?: { dateFrom?: string; dateTo?: string; planId?: number }) =>
  useQuery({
    queryKey: queryKeys.admin.kpis(params?.dateFrom, params?.dateTo, params?.planId),
    queryFn: () => adminRepository.getKpis(params),
    staleTime: 1000 * 60,
  });

export const useAdminUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: adminRepository.getUsers,
    staleTime: 1000 * 60,
  });

export const useAdminUserDetailQuery = (userId?: number) =>
  useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: () => adminRepository.getUserDetail(userId as number),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminCreateUserRequest) => adminRepository.createAdminUser(input),
    onSuccess: async (createdUser) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(createdUser.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() }),
      ]);
    },
  });
};

export const useAdminUpdateUserBasicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: number; name?: string; email?: string; isActive?: boolean }) =>
      adminRepository.updateUserBasic(input.userId, {
        name: input.name,
        email: input.email,
        isActive: input.isActive,
      }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() }),
      ]);
    },
  });
};

export const useAdminUserControlActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: number; request: AdminUserControlRequest }) =>
      adminRepository.applyUserControlAction(input.userId, input.request),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.blockedUsers() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() }),
      ]);
    },
  });
};

export const useAdminDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => adminRepository.deleteUser(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() }),
      ]);
    },
  });
};

export const useAdminBlockedUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.blockedUsers(),
    queryFn: adminRepository.getBlockedUsers,
    staleTime: 1000 * 30,
  });

export const useAdminExpiringLicensesQuery = (windowDays: 7 | 30) =>
  useQuery({
    queryKey: queryKeys.admin.expiringLicenses(windowDays),
    queryFn: () => adminRepository.getExpiringLicenses(windowDays),
    staleTime: 1000 * 60,
  });

export const useAdminAuditLogsQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.auditLogs(),
    queryFn: adminRepository.getAuditLogs,
    staleTime: 1000 * 30,
  });
