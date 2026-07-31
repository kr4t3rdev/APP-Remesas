import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useDashboardData } from "./useDashboardData";
import { dashboardRepository } from "../modules/dashboard/infrastructure/dashboard.repository";
import * as currencyQueries from "../modules/currencies/application/useCurrencies";

jest.mock("../modules/dashboard/infrastructure/dashboard.repository", () => ({
  dashboardRepository: {
    getDailyReport: jest.fn(),
    getCashBalances: jest.fn(),
    getExchangeRates: jest.fn(),
    getTransactions: jest.fn(),
    getObjectives: jest.fn(),
    getFxPerformance: jest.fn(),
  },
}));
jest.mock("../modules/currencies/application/useCurrencies");

const mockedRepository = dashboardRepository as jest.Mocked<
  typeof dashboardRepository
>;

const createWrapper = (queryClient: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

describe("useDashboardData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue({
      data: {
        currencies: [{ id: 10, code: "CUP", name: "Peso cubano", symbol: "$", isActive: true }],
        primaryCurrencyId: 10,
      },
      isLoading: false,
      isFetching: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    } as any);
  });
  it("fetches collection data on the first mount while showing empty placeholders", async () => {
    mockedRepository.getDailyReport.mockResolvedValueOnce({} as never);
    mockedRepository.getCashBalances.mockResolvedValueOnce([]);
    mockedRepository.getExchangeRates.mockResolvedValueOnce([]);
    mockedRepository.getTransactions.mockResolvedValueOnce([]);
    mockedRepository.getObjectives.mockResolvedValueOnce([]);
    mockedRepository.getFxPerformance.mockResolvedValueOnce({} as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.cashBalances).toEqual([]);
    expect(result.current.exchangeRates).toEqual([]);
    expect(result.current.recentTransactions).toEqual([]);
    expect(result.current.activeObjectives).toEqual([]);

    await waitFor(() => {
      expect(mockedRepository.getDailyReport).toHaveBeenCalledTimes(1);
      expect(mockedRepository.getCashBalances).toHaveBeenCalledTimes(1);
      expect(mockedRepository.getExchangeRates).toHaveBeenCalledTimes(1);
      expect(mockedRepository.getTransactions).toHaveBeenCalledTimes(1);
      expect(mockedRepository.getObjectives).toHaveBeenCalledWith("ACTIVO");
      expect(mockedRepository.getFxPerformance).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
    });

    queryClient.clear();
  });

  it("does not present unconverted foreign balances or expenses as CUP", async () => {
    mockedRepository.getDailyReport.mockResolvedValueOnce({
      expenses: { totalAmount: 50, totalAmountInCup: null, unconvertedCount: 1 },
    } as never);
    mockedRepository.getCashBalances.mockResolvedValueOnce([{
      id: 1,
      currencyId: 2,
      balance: 100,
      currency: { id: 2, code: "USD", name: "US Dollar", symbol: "$", isActive: true },
    }] as never);
    mockedRepository.getExchangeRates.mockResolvedValueOnce([]);
    mockedRepository.getTransactions.mockResolvedValueOnce([]);
    mockedRepository.getObjectives.mockResolvedValueOnce([]);
    mockedRepository.getFxPerformance.mockResolvedValueOnce({} as never);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary.totalCashBalance).toBeNull();
    expect(result.current.summary.todayExpenses).toBeNull();
    expect(result.current.summary.todayProfit).toBeNull();
    queryClient.clear();
  });
});
