/**
 * Admin Profile Repository
 * API calls specific to admin profile functionality
 */

import api from "../../../services/api";
import { safeObject, safeArray } from "../../../services/api-response";
import type {
  AdminAuditLogSummary,
  AdminProfileStats,
} from "../domain/admin-profile.types";

const DEFAULT_STATS: AdminProfileStats = {
  totalUsers: 0,
  activeUsers: 0,
  blockedUsers: 0,
  expiringLicenses: 0,
  dailyRevenue: 0,
  activeLicenses: 0,
};

/**
 * Get admin profile statistics
 * Returns aggregated stats for the admin dashboard
 */
export const adminProfileRepository = {
  async getStats(): Promise<AdminProfileStats> {
    try {
      console.log("[adminProfileRepository] Fetching stats from /admin/profile/stats");
      const response = await api.get<AdminProfileStats>("/admin/profile/stats");
      console.log("[adminProfileRepository] Response received:", {
        status: response.status,
        hasData: !!response.data,
        data: response.data,
      });
      const result = safeObject(response.data, DEFAULT_STATS);
      console.log("[adminProfileRepository] Returning stats:", result);
      return result;
    } catch (error) {
      console.error("[adminProfileRepository] Error fetching stats:", error);
      return DEFAULT_STATS;
    }
  },

  async getAuditLogs(limit: number = 5): Promise<AdminAuditLogSummary[]> {
    try {
      const response = await api.get<AdminAuditLogSummary[]>(
        "/admin/audit-logs",
        {
          params: { limit },
        },
      );
      return safeArray(response.data);
    } catch (error) {
      console.error("[adminProfileRepository] Error fetching audit logs:", error);
      return [];
    }
  },
};
