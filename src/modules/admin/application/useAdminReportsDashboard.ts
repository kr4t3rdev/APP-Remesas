import { useCallback, useMemo, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import type {
  AdminAuditLog,
  AdminKpiSnapshot,
  DailyBreakdownItem,
  PeriodReport,
} from "../../../types";
import { useReportsPeriodQuery } from "../../reports/application/useReports";
import { useAdminAuditLogsQuery, useAdminKpisQuery } from "./useAdminMetrics";

export type AdminReportsPeriod = "weekly" | "monthly" | "annual";

export type TrendDirection = "up" | "down" | "neutral";

export type DashboardMetricTile = {
  id: "income" | "users";
  title: string;
  valueLabel: string;
  trend: {
    direction: TrendDirection;
    valueLabel: string;
  };
  icon: "cash-outline" | "people-outline";
};

export type DashboardCashFlowBar = {
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
  cashFlow: {
    totalLabel: string;
    deltaLabel: string;
    bars: DashboardCashFlowBar[];
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

export function buildCashFlowBars(
  breakdown: DailyBreakdownItem[] = [],
  bucketCount = 6,
): DashboardCashFlowBar[] {
  if (!breakdown.length || bucketCount <= 0) return [];

  const sorted = [...breakdown]
    .filter((item) => !!normalizeDateSafe(item.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!sorted.length) return [];

  const bars: DashboardCashFlowBar[] = [];
  const chunkSize = Math.max(1, Math.ceil(sorted.length / bucketCount));

  for (let i = 0; i < bucketCount; i += 1) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = sorted.slice(start, end);

    if (!chunk.length) {
      bars.push({ label: SIMPLE_MONTH_LABELS[i] ?? `${i + 1}`, value: 0 });
      continue;
    }

    const value = chunk.reduce(
      (acc, item) => acc + (item.marginProfit ?? 0),
      0,
    );
    const last = chunk[chunk.length - 1];
    const date = normalizeDateSafe(last.date);
    const label = date
      ? (MONTH_LABELS[date.getMonth()]?.[0] ?? SIMPLE_MONTH_LABELS[i])
      : SIMPLE_MONTH_LABELS[i];

    bars.push({
      label: label || SIMPLE_MONTH_LABELS[i] || `${i + 1}`,
      value: Number(value.toFixed(2)),
    });
  }

  const maxAbs = Math.max(...bars.map((bar) => Math.abs(bar.value)), 0);
  const activeIndex =
    maxAbs <= 0
      ? Math.floor(bars.length / 2)
      : bars.findIndex((bar) => Math.abs(bar.value) === maxAbs);

  return bars.map((bar, index) => ({
    ...bar,
    isActive: index === activeIndex,
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
  const income = kpis?.mrrEstimateCup ?? 0;
  const users = kpis?.totalUsers ?? 0;
  const incomeTrend = buildTrend(kpis?.renewalRatePct ?? 0);

  const usersTrendRaw =
    kpis && kpis.totalUsers > 0
      ? ((kpis.newUsersPeriod - kpis.suspendedUsers) /
          Math.max(kpis.totalUsers, 1)) *
        100
      : 0;

  const usersTrend = buildTrend(usersTrendRaw);

  return [
    {
      id: "income",
      title: "Ingresos",
      valueLabel: formatCurrencyLabel(income),
      trend: incomeTrend,
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

function buildCashFlowModel(
  kpis: AdminKpiSnapshot | null,
  periodReport?: PeriodReport | null,
) {
  const bars = buildCashFlowBars(periodReport?.dailyBreakdown ?? []);
  const totalValue = periodReport?.summary?.netProfit ?? 0;
  const delta = buildTrend(kpis?.trialToPaidConversionPct ?? 0);

  const deltaPrefix =
    delta.direction === "up" ? "+" : delta.direction === "down" ? "-" : "";

  return {
    totalLabel: formatCurrencyLabel(totalValue),
    deltaLabel: `${deltaPrefix}${delta.valueLabel}`,
    bars,
    isEmpty: !bars.length || bars.every((bar) => bar.value === 0),
  };
}

export const useAdminReportsDashboard = (): AdminReportsDashboardVM => {
  const [period, setPeriod] = useState<AdminReportsPeriod>("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshFailures, setLastRefreshFailures] = useState({
    kpis: false,
    period: false,
    audit: false,
  });

  const periodRange = useMemo(() => resolvePeriodRange(period), [period]);

  const kpisQuery = useAdminKpisQuery({
    dateFrom: periodRange.startDate,
    dateTo: periodRange.endDate,
  });
  const periodReportQuery = useReportsPeriodQuery(
    periodRange.startDate,
    periodRange.endDate,
  );
  const auditLogsQuery = useAdminAuditLogsQuery();

  const refetchAll = useCallback(async () => {
    setIsRefreshing(true);

    const results = await Promise.allSettled([
      kpisQuery.refetch(),
      periodReportQuery.refetch(),
      auditLogsQuery.refetch(),
    ]);

    setLastRefreshFailures({
      kpis: results[0].status === "rejected",
      period: results[1].status === "rejected",
      audit: results[2].status === "rejected",
    });

    setIsRefreshing(false);
  }, [auditLogsQuery, kpisQuery, periodReportQuery]);

  const metricTiles = useMemo(
    () => buildMetricTiles(kpisQuery.data ?? null),
    [kpisQuery.data],
  );

  const cashFlow = useMemo(
    () =>
      buildCashFlowModel(
        kpisQuery.data ?? null,
        periodReportQuery.data ?? null,
      ),
    [kpisQuery.data, periodReportQuery.data],
  );

  const usersGrowth = useMemo(
    () => buildUsersGrowthPoints(auditLogsQuery.data ?? []),
    [auditLogsQuery.data],
  );

  const isLoading =
    kpisQuery.isLoading ||
    periodReportQuery.isLoading ||
    auditLogsQuery.isLoading;

  const hasPartialError =
    kpisQuery.isError ||
    periodReportQuery.isError ||
    auditLogsQuery.isError ||
    lastRefreshFailures.kpis ||
    lastRefreshFailures.period ||
    lastRefreshFailures.audit;

  return {
    period,
    metricTiles,
    cashFlow,
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
