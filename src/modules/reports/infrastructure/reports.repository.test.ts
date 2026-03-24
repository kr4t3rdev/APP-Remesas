import api from "../../../services/api";
import { reportsRepository } from "./reports.repository";

jest.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("reportsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests daily report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { date: "2026-03-06" } });

    const result = await reportsRepository.getDailyReport("2026-03-06");

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/daily", {
      params: { date: "2026-03-06" },
    });
    expect(result).toEqual({ date: "2026-03-06" });
  });

  it("requests period report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { period: {} } });

    const result = await reportsRepository.getPeriodReport(
      "2026-01-01",
      "2026-03-06",
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/period", {
      params: { startDate: "2026-01-01", endDate: "2026-03-06" },
    });
    expect(result).toEqual({ period: {} });
  });

  it("requests profit report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { totalMarginProfit: 5000 } });

    const result = await reportsRepository.getProfitReport(
      "2026-01-01",
      "2026-03-06",
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/profit", {
      params: { startDate: "2026-01-01", endDate: "2026-03-06" },
    });
    expect(result).toEqual({ totalMarginProfit: 5000 });
  });

  it("requests currency report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { currencyId: 1 } });

    const result = await reportsRepository.getCurrencyReport(
      1,
      "2026-01-01",
      "2026-03-06",
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/currency/1", {
      params: { startDate: "2026-01-01", endDate: "2026-03-06" },
    });
    expect(result).toEqual({ currencyId: 1 });
  });

  it("requests expenses report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { total: 10 } });

    const result = await reportsRepository.getExpensesReport(
      "2026-01-01",
      "2026-03-06",
      "servicios",
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/expenses", {
      params: {
        startDate: "2026-01-01",
        endDate: "2026-03-06",
        category: "servicios",
      },
    });
    expect(result).toEqual({ total: 10 });
  });

  it("requests accounts report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { totalAccounts: 3 } });

    const result = await reportsRepository.getAccountsReport();

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/accounts");
    expect(result).toEqual({ totalAccounts: 3 });
  });

  it("requests objectives report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { total: 5 } });

    const result = await reportsRepository.getObjectivesReport();

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/objectives");
    expect(result).toEqual({ total: 5 });
  });

  it("requests cash flow report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { inflows: {} } });

    const result = await reportsRepository.getCashFlowReport(
      "2026-01-01",
      "2026-03-06",
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/cash-flow", {
      params: { startDate: "2026-01-01", endDate: "2026-03-06" },
    });
    expect(result).toEqual({ inflows: {} });
  });

  it("requests audit summary report", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { totalAudits: 2 } });

    const result = await reportsRepository.getAuditSummary(
      "2026-01-01",
      "2026-03-06",
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/reports/audit-summary", {
      params: { startDate: "2026-01-01", endDate: "2026-03-06" },
    });
    expect(result).toEqual({ totalAudits: 2 });
  });
});
