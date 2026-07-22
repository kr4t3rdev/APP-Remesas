import api from "../../../services/api";
import type { NotificationsPage, UserNotification } from "../../../types";

export const notificationsRepository = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsPage> {
    const response = await api.get<NotificationsPage>("/notifications", {
      params,
    });
    return response.data!;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>(
      "/notifications/unread-count",
    );
    return response.data!.count;
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};

export type { UserNotification };
