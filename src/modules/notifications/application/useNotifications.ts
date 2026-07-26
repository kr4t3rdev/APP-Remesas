import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { notificationsRepository } from "../infrastructure/notifications.repository";

export const useNotificationsInfiniteQuery = (limit = 20, enabled = true) =>
	useInfiniteQuery({
		queryKey: queryKeys.notifications.infinite(),
		queryFn: ({ pageParam = 1 }) =>
			notificationsRepository.getNotifications({
				page: pageParam as number,
				limit,
			}),
		getNextPageParam: (lastPage) => {
			if (lastPage.meta.page < lastPage.meta.totalPages) {
				return lastPage.meta.page + 1;
			}
			return undefined;
		},
		initialPageParam: 1,
		staleTime: 1000 * 30,
		enabled,
	});

export const useNotificationsQuery = (_page = 1, limit = 20, enabled = true) =>
	useQuery({
		queryKey: queryKeys.notifications.list(),
		queryFn: () =>
			notificationsRepository.getNotifications({ page: _page, limit }),
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
				queryClient.invalidateQueries({
					queryKey: queryKeys.notifications.list(),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.notifications.infinite(),
				}),
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
				queryClient.invalidateQueries({
					queryKey: queryKeys.notifications.list(),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.notifications.infinite(),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.notifications.unreadCount(),
				}),
			]);
		},
	});
};
