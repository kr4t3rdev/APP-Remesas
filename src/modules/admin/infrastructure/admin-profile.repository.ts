/**
 * Admin Profile Repository
 * API calls specific to admin profile functionality
 */

import api from "../../../services/api";
import type {
  AdminAuditLogSummary,
  AdminProfileStats,
} from "../domain/admin-profile.types";

/**
 * Get admin profile statistics
 * Returns aggregated stats for the admin dashboard
 */
export const adminProfileRepository = {
  async getStats(): Promise<AdminProfileStats> {
    const response = await api.get<AdminProfileStats>("/admin/profile/stats");
    return response.data;
  },

  async getAuditLogs(limit: number = 5): Promise<AdminAuditLogSummary[]> {
    const response = await api.get<AdminAuditLogSummary[]>(
      "/admin/audit-logs",
      {
        params: { limit },
      },
    );
    return response.data;
  },
};
