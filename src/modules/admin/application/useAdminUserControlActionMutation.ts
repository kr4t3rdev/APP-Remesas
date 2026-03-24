import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminUserControlRequest } from "../../../types";
import { queryKeys } from "../../../shared/query/queryKeys";
import { adminRepository } from "../infrastructure/admin.repository";
import { getApiErrorMessage } from "../../../utils/apiError";

type UseAdminUserControlActionOptions = {
  showSuccessAlert?: boolean;
};

export const useAdminUserControlActionMutation = (
  options?: UseAdminUserControlActionOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: number; request: AdminUserControlRequest }) =>
      adminRepository.applyUserControlAction(input.userId, input.request),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.userDetail(variables.userId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.blockedUsers(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.auditLogs(),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.kpis() }),
      ]);

      if (options?.showSuccessAlert) {
        Alert.alert("Éxito", "Acción ejecutada correctamente");
      }
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        getApiErrorMessage(error, "No se pudo ejecutar la acción"),
      );
    },
  });
};
