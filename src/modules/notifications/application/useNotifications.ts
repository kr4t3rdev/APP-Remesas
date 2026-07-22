import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { notificationsRepository } from "../infrastructure/notifications.repository";

export const useNotificationsQuery = (page = 1, limit = 20, enabled = true) =>
  useQuery({
    queryKey: queryKeys.notifications.list(page),
    queryFn: () => notificationsRepository.getNotifications({ page, limit }),
    staleTime: 1000 * 30,
    throwOnError: false,
    enabled,
  });

export const useUnreadNotificationsCountQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsRepository.getUnreadCount,
    staleTime: 1000 * 30,
    throwOnError: false,
  });

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsRepository.markAsRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(),
        }),
      ]);
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsRepository.markAllAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(),
        }),
      ]);
    },
  });
};
