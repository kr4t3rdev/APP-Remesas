import { useCallback, useMemo, useState } from "react";
import type { AdminAuditLog, AdminKpiSnapshot } from "../../../types";
import {
  useAdminAuditLogsQuery,
  useAdminBlockedUsersQuery,
  useAdminExpiringLicensesQuery,
  useAdminKpisQuery,
} from "./useAdminMetrics";

export type AdminHomeViewModel = {
  kpis: AdminKpiSnapshot | null;
  blockedUsersCount: number;
  expiring7dCount: number;
  licenseStateEntries: Array<{ state: string; count: number }>;
  recentEvents: AdminAuditLog[];
  isLoadingInitial: boolean;
  isRefreshing: boolean;
  hasPartialFailure: boolean;
  blockErrors: {
    kpis: boolean;
    licenseState: boolean;
    events: boolean;
  };
  refetchAll: () => Promise<void>;
};

export const useAdminHomeData = (): AdminHomeViewModel => {
  const kpisQuery = useAdminKpisQuery();
  const blockedUsersQuery = useAdminBlockedUsersQuery();
  const expiringQuery = useAdminExpiringLicensesQuery(7);
  const auditLogsQuery = useAdminAuditLogsQuery();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshFailures, setLastRefreshFailures] = useState({
    kpis: false,
    blockedUsers: false,
    expiringLicenses: false,
    auditLogs: false,
  });

  const refetchAll = useCallback(async () => {
    setIsRefreshing(true);
    const results = await Promise.allSettled([
      kpisQuery.refetch(),
      blockedUsersQuery.refetch(),
      expiringQuery.refetch(),
      auditLogsQuery.refetch(),
    ]);

    setLastRefreshFailures({
      kpis: results[0].status === "rejected",
      blockedUsers: results[1].status === "rejected",
      expiringLicenses: results[2].status === "rejected",
      auditLogs: results[3].status === "rejected",
    });

    setIsRefreshing(false);
  }, [kpisQuery, blockedUsersQuery, expiringQuery, auditLogsQuery]);

  const kpis = kpisQuery.data ?? null;
  const blockedUsersCount =
    (blockedUsersQuery.data?.length ?? 0) || kpis?.suspendedUsers || 0;
  const expiring7dCount = expiringQuery.data?.length ?? 0;

  const licenseStateEntries = useMemo(
    () =>
      Object.entries(kpis?.licensesByState ?? {})
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count),
    [kpis?.licensesByState],
  );

  const recentEvents = useMemo(
    () =>
      [...(auditLogsQuery.data ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 8),
    [auditLogsQuery.data],
  );

  const isLoadingInitial =
    kpisQuery.isLoading ||
    blockedUsersQuery.isLoading ||
    expiringQuery.isLoading ||
    auditLogsQuery.isLoading;

  const blockErrors = {
    kpis:
      kpisQuery.isError ||
      lastRefreshFailures.kpis ||
      lastRefreshFailures.blockedUsers,
    licenseState:
      kpisQuery.isError ||
      expiringQuery.isError ||
      lastRefreshFailures.expiringLicenses,
    events: auditLogsQuery.isError || lastRefreshFailures.auditLogs,
  };

  return {
    kpis,
    blockedUsersCount,
    expiring7dCount,
    licenseStateEntries,
    recentEvents,
    isLoadingInitial,
    isRefreshing,
    hasPartialFailure:
      blockErrors.kpis || blockErrors.licenseState || blockErrors.events,
    blockErrors,
    refetchAll,
  };
};
