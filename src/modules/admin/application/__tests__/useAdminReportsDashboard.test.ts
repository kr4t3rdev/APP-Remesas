import {
  buildPlatformBars,
  buildTrend,
  buildUsersGrowthPoints,
  resolvePeriodRange,
} from "../useAdminReportsDashboard";

describe("useAdminReportsDashboard helpers", () => {
  it("resolves monthly date range with monthly as default interval logic", () => {
    const result = resolvePeriodRange(
      "monthly",
      new Date("2026-03-07T10:00:00.000Z"),
    );

    expect(result).toEqual({
      startDate: "2026-02-06",
      endDate: "2026-03-07",
    });
  });

  it("builds up/down trends with absolute label", () => {
    expect(buildTrend(12.5)).toEqual({ direction: "up", valueLabel: "12.5%" });
    expect(buildTrend(-2.1)).toEqual({ direction: "down", valueLabel: "2.1%" });
    expect(buildTrend(0)).toEqual({ direction: "neutral", valueLabel: "0.0%" });
  });

  it("creates 6 platform bars from real platform series data", () => {
    const series = [
      { label: "ENE", year: 2026, month: 0, billingCup: "100", newUsers: 5, churn: 1 },
      { label: "FEB", year: 2026, month: 1, billingCup: "250", newUsers: 8, churn: 2 },
      { label: "MAR", year: 2026, month: 2, billingCup: "400", newUsers: 12, churn: 1 },
      { label: "ABR", year: 2026, month: 3, billingCup: "600", newUsers: 15, churn: 3 },
      { label: "MAY", year: 2026, month: 4, billingCup: "500", newUsers: 10, churn: 2 },
      { label: "JUN", year: 2026, month: 5, billingCup: "700", newUsers: 18, churn: 4 },
    ];

    const bars = buildPlatformBars(series);
    expect(bars).toHaveLength(6);
    expect(bars.filter((bar) => bar.isActive)).toHaveLength(1);
    expect(bars[5].isActive).toBe(true);
    expect(bars[5].value).toBe(700);
  });

  it("returns empty bars when series is empty", () => {
    expect(buildPlatformBars([])).toEqual([]);
  });

  it("creates growth points and avoids duplicate peak label when top values are tied", () => {
    const logs = [
      {
        id: 1,
        actorUserId: 1,
        action: "A",
        createdAt: "2026-02-01T10:00:00.000Z",
      },
      {
        id: 2,
        actorUserId: 1,
        action: "B",
        createdAt: "2026-02-10T10:00:00.000Z",
      },
      {
        id: 3,
        actorUserId: 1,
        action: "C",
        createdAt: "2026-03-01T10:00:00.000Z",
      },
      {
        id: 4,
        actorUserId: 1,
        action: "D",
        createdAt: "2026-03-11T10:00:00.000Z",
      },
    ];

    const result = buildUsersGrowthPoints(
      logs as any,
      new Date("2026-03-15T10:00:00.000Z"),
    );

    expect(result.points).toHaveLength(6);
    expect(result.peakLabel).toBeUndefined();
  });
});
