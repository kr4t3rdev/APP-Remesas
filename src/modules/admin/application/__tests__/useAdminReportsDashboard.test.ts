import {
  buildCashFlowBars,
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

  it("creates 6 bars and marks the max absolute value as active", () => {
    const bars = buildCashFlowBars([
      { date: "2026-01-01", transactions: 100, transactionsTotalCup: 100, expenses: 80, expensesTotalCup: 80, expensesUnconverted: 0, marginProfit: 20 },
      { date: "2026-01-05", transactions: 300, transactionsTotalCup: 300, expenses: 100, expensesTotalCup: 100, expensesUnconverted: 0, marginProfit: 200 },
      { date: "2026-01-10", transactions: 200, transactionsTotalCup: 200, expenses: 190, expensesTotalCup: 190, expensesUnconverted: 0, marginProfit: 10 },
      { date: "2026-01-15", transactions: 450, transactionsTotalCup: 450, expenses: 100, expensesTotalCup: 100, expensesUnconverted: 0, marginProfit: 350 },
      { date: "2026-01-20", transactions: 120, transactionsTotalCup: 120, expenses: 20, expensesTotalCup: 20, expensesUnconverted: 0, marginProfit: 100 },
      { date: "2026-01-25", transactions: 80, transactionsTotalCup: 80, expenses: 70, expensesTotalCup: 70, expensesUnconverted: 0, marginProfit: 10 },
    ]);

    expect(bars).toHaveLength(6);
    expect(bars.filter((bar) => bar.isActive)).toHaveLength(1);
    expect(bars.some((bar) => bar.value !== 0)).toBe(true);
    expect(bars[3].isActive).toBe(true);
    expect(bars[3].value).toBe(350);
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
