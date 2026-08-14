import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ReportsScreen } from "../ReportsScreen.web";
import { useReportsPeriodQuery, useReportsProfitQuery, useReportsCashFlowQuery } from "../../../modules/reports/application/useReports";

jest.mock("../../../modules/reports/application/useReports", () => ({ useReportsPeriodQuery: jest.fn(), useReportsProfitQuery: jest.fn(), useReportsCashFlowQuery: jest.fn() }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })) }));

const period = useReportsPeriodQuery as jest.Mock;
const profit = useReportsProfitQuery as jest.Mock;
const cashflow = useReportsCashFlowQuery as jest.Mock;
describe("ReportsScreen web surface", () => {
  beforeEach(() => { jest.clearAllMocks(); period.mockReturnValue({ data: { summary: { totalTransactions: 10, totalExpensesCount: 3, totalExpensesAmount: 100, totalExpensesInCup: 100, unconvertedExpensesCount: 0, marginProfit: 700, netProfit: 600 }, dailyBreakdown: [] }, isLoading: false, isError: false, refetch: jest.fn() }); profit.mockReturnValue({ data: { totalMarginProfit: 700, netFlow: 600, totalCompras: 1000, totalVentas: 1700, byCurrency: {} }, isLoading: false, isError: false }); cashflow.mockReturnValue({ data: { currencies: [{ currency: { code: "CUP", symbol: "$" }, inflows: { transactions: 1700, adjustments: 0, total: 1700 }, outflows: { transactions: 1000, expenses: 100, adjustments: 0, total: 1100 }, balance: 600 }] }, isLoading: false, isError: false }); });
  it("renders financial report cards and period controls", () => { const { getByText, getByTestId } = render(<NavigationContainer><ReportsScreen /></NavigationContainer>); expect(getByText("Reportes operativos")).toBeTruthy(); expect(getByText("Ganancia neta")).toBeTruthy(); expect(getByText("Flujo por moneda")).toBeTruthy(); expect(getByTestId("web-report-period-30")).toBeTruthy(); });
  it("changes the period control", () => { const { getByTestId } = render(<NavigationContainer><ReportsScreen /></NavigationContainer>); fireEvent.press(getByTestId("web-report-period-7")); expect(period).toHaveBeenLastCalledWith(expect.any(String), expect.any(String)); });
});
