import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useReportsPeriodQuery,
  useReportsProfitQuery,
  useReportsCurrencyQuery,
  useReportsExpensesQuery,
  useReportsAccountsQuery,
  useReportsObjectivesQuery,
  useReportsCashFlowQuery,
  useReportsAuditSummaryQuery,
} from "./useReports";
import { reportsRepository } from "../infrastructure/reports.repository";

jest.mock("../infrastructure/reports.repository", () => ({
  reportsRepository: {
    getPeriodReport: jest.fn(),
    getProfitReport: jest.fn(),
    getCurrencyReport: jest.fn(),
    getExpensesReport: jest.fn(),
    getAccountsReport: jest.fn(),
    getObjectivesReport: jest.fn(),
    getCashFlowReport: jest.fn(),
    getAuditSummary: jest.fn(),
  },
}));

const mockedRepository = reportsRepository as jest.Mocked<
  typeof reportsRepository
>;

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useReports hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads period report with date range", async () => {
    mockedRepository.getPeriodReport.mockResolvedValueOnce({
      period: { startDate: "2026-01-01" },
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportsPeriodQuery("2026-01-01", "2026-03-06"),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getPeriodReport).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-03-06",
    );
  });

  it("loads profit report with date range", async () => {
    mockedRepository.getProfitReport.mockResolvedValueOnce({
      totalMarginProfit: 5000,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportsProfitQuery("2026-01-01", "2026-03-06"),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getProfitReport).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-03-06",
    );
  });

  it("loads currency report by id", async () => {
    mockedRepository.getCurrencyReport.mockResolvedValueOnce({
      currencyId: 1,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportsCurrencyQuery(1, "2026-01-01", "2026-03-06"),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getCurrencyReport).toHaveBeenCalledWith(
      1,
      "2026-01-01",
      "2026-03-06",
    );
  });

  it("loads expenses report with filters", async () => {
    mockedRepository.getExpensesReport.mockResolvedValueOnce({
      total: 10,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportsExpensesQuery("2026-01-01", "2026-03-06", "servicios"),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getExpensesReport).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-03-06",
      "servicios",
    );
  });

  it("loads accounts report", async () => {
    mockedRepository.getAccountsReport.mockResolvedValueOnce({
      totalAccounts: 3,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useReportsAccountsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getAccountsReport).toHaveBeenCalled();
  });

  it("loads objectives report", async () => {
    mockedRepository.getObjectivesReport.mockResolvedValueOnce({
      total: 5,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useReportsObjectivesQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getObjectivesReport).toHaveBeenCalled();
  });

  it("loads cash flow report with date range", async () => {
    mockedRepository.getCashFlowReport.mockResolvedValueOnce({
      period: { startDate: "2026-01-01", endDate: "2026-03-06" },
      currencies: [],
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportsCashFlowQuery("2026-01-01", "2026-03-06"),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getCashFlowReport).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-03-06",
    );
  });

  it("does not request reports for inverted ranges", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(
      () => useReportsCashFlowQuery("2026-03-06", "2026-01-01", false),
      { wrapper: createWrapper(queryClient) },
    );

    expect(mockedRepository.getCashFlowReport).not.toHaveBeenCalled();
  });

  it("loads audit summary with date range", async () => {
    mockedRepository.getAuditSummary.mockResolvedValueOnce({
      totalAudits: 2,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportsAuditSummaryQuery("2026-01-01", "2026-03-06"),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getAuditSummary).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-03-06",
    );
  });
});
