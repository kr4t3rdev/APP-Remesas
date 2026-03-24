/**
 * Admin Audit Logs Query Hook for Profile
 * Custom hook for fetching recent audit logs for admin profile
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { adminProfileRepository } from "../infrastructure/admin-profile.repository";

export const useAdminAuditLogsProfileQuery = (limit: number = 5) =>
  useQuery({
    queryKey: queryKeys.admin.profileAuditLogs(limit),
    queryFn: () => adminProfileRepository.getAuditLogs(limit),
    staleTime: 1000 * 30, // 30 seconds
  });
