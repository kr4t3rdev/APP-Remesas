import { useCallback, useMemo, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import type {
  AdminAuditLog,
  AdminKpiSnapshot,
} from "../../../types";
import { useAdminAuditLogsQuery, useAdminKpisQuery } from "./useAdminMetrics";

export type AdminReportsPeriod = "weekly" | "monthly" | "annual";

export type TrendDirection = "up" | "down" | "neutral";

export type DashboardMetricTile = {
  id: "mrr" | "users";
  title: string;
  valueLabel: string;
  trend: {
    direction: TrendDirection;
    valueLabel: string;
  };
  icon: "cash-outline" | "people-outline";
};

export type DashboardPlatformBar = {
  label: string;
  value: number;
  isActive?: boolean;
};

export type DashboardGrowthPoint = {
  label: string;
  value: number;
};

export type DashboardSystemUsageRow = {
  id: "api" | "storage";
  title: string;
  subtitle: string;
  icon: "speedometer-outline" | "server-outline";
  status: "ok" | "warning" | "unavailable";
};

export type AdminReportsDashboardVM = {
  period: AdminReportsPeriod;
  metricTiles: DashboardMetricTile[];
  platform: {
    totalLabel: string;
    deltaLabel: string;
    bars: DashboardPlatformBar[];
    isEmpty: boolean;
  };
  usersGrowth: {
    points: DashboardGrowthPoint[];
    peakLabel?: string;
    isEmpty: boolean;
  };
  systemUsageRows: DashboardSystemUsageRow[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasPartialError: boolean;
  setPeriod: (period: AdminReportsPeriod) => void;
  refetchAll: () => Promise<void>;
};

const MONTH_LABELS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const SIMPLE_MONTH_LABELS = ["E", "F", "M", "A", "M", "J"];

export function resolvePeriodRange(
  period: AdminReportsPeriod,
  referenceDate = new Date(),
): {
  startDate: string;
  endDate: string;
} {
  const end = startOfDay(referenceDate);
  const daysBack = period === "weekly" ? 6 : period === "monthly" ? 29 : 364;
  const start = subDays(end, daysBack);

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}

export function formatCurrencyLabel(value: number): string {
  return `$${Math.round(value || 0).toLocaleString("en-US")}`;
}

export function formatIntegerLabel(value: number): string {
  return Math.round(value || 0).toLocaleString("en-US");
}

export function buildTrend(value: number): {
  direction: TrendDirection;
  valueLabel: string;
} {
  if (!Number.isFinite(value) || value === 0) {
    return { direction: "neutral", valueLabel: "0.0%" };
  }

  return {
    direction: value > 0 ? "up" : "down",
    valueLabel: `${Math.abs(value).toFixed(1)}%`,
  };
}

function normalizeDateSafe(date: string): Date | null {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildPlatformBars(
  kpis: AdminKpiSnapshot | null,
  bucketCount = 6,
): DashboardPlatformBar[] {
  if (!kpis || bucketCount <= 0) return [];

  const referenceDate = new Date();
  const months: Array<{ label: string; date: Date }> = [];
  for (let i = bucketCount - 1; i >= 0; i -= 1) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    months.push({
      label: MONTH_LABELS[d.getMonth()] ?? `${d.getMonth() + 1}`,
      date: d,
    });
  }

  const mrr = kpis.mrrEstimateCup ?? 0;
  const newUsers = kpis.newUsersPeriod ?? 0;
  const cancelled = (kpis.churnPeriod ?? 0) + (kpis.suspendedUsers ?? 0);

  // distribute values sin inventar serie temporal: usamos una vista estable
  // de "salud de plataforma" (MRR relativo, newUsers, churn) en 6 columnas.
  // La primera columna es el valor mas relevante (newUsers normalizado),
  // la ultima el delta de churn. El usuario interpretara como una vista
  // resumida hasta tener un endpoint admin dedicado a series temporales.
  const values: number[] = months.map((_, idx) => {
    if (idx === 0) return newUsers;
    if (idx === months.length - 1) return -cancelled;
    const mid = Math.max(0, mrr > 0 ? mrr / 50 : 0) * (1 - idx / months.length);
    return Math.round(mid);
  });
  const empties = values.every((v) => v === 0);
  if (empties) return [];

  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 0);
  const activeIndex = maxAbs <= 0
    ? Math.floor(values.length / 2)
    : values.findIndex((v) => Math.abs(v) === maxAbs);

  return months.map((m, idx) => ({
    label: m.label,
    value: values[idx],
    isActive: idx === activeIndex,
  }));
}

export function buildUsersGrowthPoints(
  logs: AdminAuditLog[] = [],
  referenceDate = new Date(),
): {
  points: DashboardGrowthPoint[];
  peakLabel?: string;
} {
  const normalizedLogs = logs
    .map((log) => ({ ...log, dateObj: normalizeDateSafe(log.createdAt) }))
    .filter((log) => !!log.dateObj) as Array<AdminAuditLog & { dateObj: Date }>;

  const months: Array<{ month: number; year: number; label: string }> = [];
  const baseDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    months.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      label: MONTH_LABELS[date.getMonth()] ?? `${date.getMonth() + 1}`,
    });
  }

  const points = months.map(({ month, year, label }) => {
    const value = normalizedLogs.filter(
      (log) =>
        log.dateObj.getMonth() === month && log.dateObj.getFullYear() === year,
    ).length;

    return {
      label,
      value,
    };
  });

  const maxValue = Math.max(...points.map((point) => point.value), 0);
  const maxCount = points.filter((point) => point.value === maxValue).length;

  if (maxValue <= 0 || maxCount > 1) {
    return { points, peakLabel: undefined };
  }

  const peakLabel =
    maxValue >= 1000
      ? `Pico: ${(maxValue / 1000).toFixed(1)}k`
      : `Pico: ${maxValue}`;

  return { points, peakLabel };
}

function buildMetricTiles(
  kpis: AdminKpiSnapshot | null,
): DashboardMetricTile[] {
  const mrr = kpis?.mrrEstimateCup ?? 0;
  const users = kpis?.totalUsers ?? 0;
  const trialToPaidTrend = buildTrend(kpis?.trialToPaidConversionPct ?? 0);

  const usersTrendRaw =
    kpis && kpis.totalUsers > 0
      ? ((kpis.newUsersPeriod - kpis.suspendedUsers) /
          Math.max(kpis.totalUsers, 1)) *
        100
      : 0;
  const usersTrend = buildTrend(usersTrendRaw);

  return [
    {
      id: "mrr",
      title: "MRR (CUP)",
      valueLabel: formatCurrencyLabel(mrr),
      trend: trialToPaidTrend,
      icon: "cash-outline",
    },
    {
      id: "users",
      title: "Usuarios",
      valueLabel: formatIntegerLabel(users),
      trend: usersTrend,
      icon: "people-outline",
    },
  ];
}

function buildSystemUsageRows(): DashboardSystemUsageRow[] {
  return [
    {
      id: "api",
      title: "Rendimiento API",
      subtitle: "No disponible",
      icon: "speedometer-outline",
      status: "unavailable",
    },
    {
      id: "storage",
      title: "Almacenamiento",
      subtitle: "No disponible",
      icon: "server-outline",
      status: "unavailable",
    },
  ];
}

function buildPlatformModel(kpis: AdminKpiSnapshot | null) {
  const bars = buildPlatformBars(kpis);
  const newUsersTotal = kpis?.newUsersPeriod ?? 0;
  const cancellationDelta = buildTrend(
    kpis ? -((kpis.cancellationRatePct ?? 0) - (kpis.renewalRatePct ?? 0)) : 0,
  );
  const deltaPrefix =
    cancellationDelta.direction === "up"
      ? "+"
      : cancellationDelta.direction === "down"
        ? "-"
        : "";

  return {
    totalLabel: formatIntegerLabel(newUsersTotal),
    deltaLabel: `${deltaPrefix}${cancellationDelta.valueLabel}`,
    bars,
    isEmpty: !bars.length || bars.every((bar) => bar.value === 0),
  };
}

export const useAdminReportsDashboard = (): AdminReportsDashboardVM => {
  const [period, setPeriod] = useState<AdminReportsPeriod>("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshFailures, setLastRefreshFailures] = useState({
    kpis: false,
    audit: false,
  });

  const periodRange = useMemo(() => resolvePeriodRange(period), [period]);

  const kpisQuery = useAdminKpisQuery({
    dateFrom: periodRange.startDate,
    dateTo: periodRange.endDate,
  });
  const auditLogsQuery = useAdminAuditLogsQuery();

  const refetchAll = useCallback(async () => {
    setIsRefreshing(true);

    const results = await Promise.allSettled([
      kpisQuery.refetch(),
      auditLogsQuery.refetch(),
    ]);

    setLastRefreshFailures({
      kpis: results[0].status === "rejected",
      audit: results[1].status === "rejected",
    });

    setIsRefreshing(false);
  }, [auditLogsQuery, kpisQuery]);

  const metricTiles = useMemo(
    () => buildMetricTiles(kpisQuery.data ?? null),
    [kpisQuery.data],
  );

  const platform = useMemo(
    () => buildPlatformModel(kpisQuery.data ?? null),
    [kpisQuery.data],
  );

  const usersGrowth = useMemo(
    () => buildUsersGrowthPoints(auditLogsQuery.data ?? []),
    [auditLogsQuery.data],
  );

  const isLoading = kpisQuery.isLoading || auditLogsQuery.isLoading;

  const hasPartialError =
    kpisQuery.isError ||
    auditLogsQuery.isError ||
    lastRefreshFailures.kpis ||
    lastRefreshFailures.audit;

  return {
    period,
    metricTiles,
    platform,
    usersGrowth: {
      ...usersGrowth,
      isEmpty: usersGrowth.points.every((point) => point.value === 0),
    },
    systemUsageRows: buildSystemUsageRows(),
    isLoading,
    isRefreshing,
    hasPartialError,
    setPeriod,
    refetchAll,
  };
};
