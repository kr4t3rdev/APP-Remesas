import { getReportRangeError, isReportRangeValid } from "./reportDateRange";

describe("report date range validation", () => {
  it("rejects inverted ranges with a clear message", () => {
    expect(getReportRangeError("2026-07-31", "2026-07-01")).toBe(
      "La fecha desde debe ser anterior o igual a la fecha hasta",
    );
    expect(isReportRangeValid("2026-07-31", "2026-07-01")).toBe(false);
  });

  it("rejects periods longer than 30 days", () => {
    expect(getReportRangeError("2026-06-01", "2026-07-02")).toBe(
      "El período no puede exceder 30 días",
    );
  });

  it("accepts an ordered range of at most 30 days", () => {
    expect(getReportRangeError("2026-07-01", "2026-07-31")).toBeNull();
    expect(isReportRangeValid("2026-07-01", "2026-07-31")).toBe(true);
  });
});
