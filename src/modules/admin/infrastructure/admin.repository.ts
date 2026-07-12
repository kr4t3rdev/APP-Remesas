import api from "../../../services/api";
import type {
  AdminAuditLog,
  AdminCreateUserRequest,
  AdminKpiSnapshot,
  AdminUserControlRequest,
  AdminUserDetail,
  User,
  UserLicense,
} from "../../../types";

export const adminRepository = {
  async getKpis(params?: {
    dateFrom?: string;
    dateTo?: string;
    planId?: number;
  }): Promise<AdminKpiSnapshot> {
    const response = await api.get<AdminKpiSnapshot>("/admin/kpis", { params });
    return response.data!;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/admin/users");
    return Array.isArray(response.data) ? response.data : [];
  },

  async createAdminUser(input: AdminCreateUserRequest): Promise<User> {
    const response = await api.post<User>("/admin/users", input);
    return response.data!;
  },

  async getUserDetail(userId: number): Promise<AdminUserDetail> {
    const response = await api.get<AdminUserDetail>(`/admin/users/${userId}`);
    return response.data!;
  },

  async updateUserBasic(
    userId: number,
    data: { name?: string; email?: string; isActive?: boolean },
  ): Promise<User> {
    const response = await api.patch<User>(`/admin/users/${userId}`, data);
    return response.data!;
  },

  async applyUserControlAction(
    userId: number,
    request: AdminUserControlRequest,
  ): Promise<unknown> {
    const response = await api.post(`/admin/users/${userId}/actions`, request);
    return response.data!;
  },

  async getBlockedUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/admin/users/blocked");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getExpiringLicenses(windowDays: 7 | 30): Promise<UserLicense[]> {
    const response = await api.get<UserLicense[]>("/admin/licenses/expiring", {
      params: { windowDays },
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    const response = await api.get<AdminAuditLog[]>("/admin/audit-logs");
    return Array.isArray(response.data) ? response.data : [];
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/auth/users/${userId}`);
  },
};
