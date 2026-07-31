import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ReportsScreen } from "./ReportsScreen";
import * as reports from "../../modules/reports/application/useReports";
import * as currencies from "../../modules/currencies/application/useCurrencies";

jest.mock("../../modules/reports/application/useReports");
jest.mock("../../modules/currencies/application/useCurrencies");
jest.mock("../../components/animations", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
  FadeInDown: ({ children }: { children: React.ReactNode }) => children,
  ScaleIn: ({ children }: { children: React.ReactNode }) => children,
  PressableScale: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
    const { TouchableOpacity } = require("react-native");
    return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
  },
}));
jest.mock("../../components/charts/Charts", () => {
  const { Text, View } = require("react-native");
  return {
    StatsCard: ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => <View><Text>{title}</Text><Text>{value}</Text>{subtitle ? <Text>{subtitle}</Text> : null}</View>,
    BarChart: () => null,
    HorizontalBarChart: () => null,
  };
});
jest.mock("../../components/expenses/ExpenseDatePicker", () => ({ ExpenseDatePicker: () => null }));
jest.mock("../../components/reports/CashFlowCurrencyCards", () => ({ CashFlowCurrencyCards: () => null }));
jest.mock("../profile/ProfileFeatureBackButton", () => ({ ProfileFeatureBackButton: () => null }));
jest.mock("../../store/themeStore", () => ({
  useColors: () => ({
    background: "#fff", card: "#fff", border: "#ddd", surface: "#eee",
    text: { primary: "#111", secondary: "#555", tertiary: "#777", inverse: "#fff" },
    primary: { 100: "#def", 500: "#08c" }, secondary: { 500: "#609" }, success: "#080", warning: "#a60", danger: "#c00", info: "#06c",
    financial: { compra: "#06c", venta: "#080" },
  }),
  useShadows: () => ({ md: {} }),
  useGradients: () => ({
    daily: { light: ["#fff", "#eee"], dark: ["#111", "#222"] },
    period: { light: ["#fff", "#eee"], dark: ["#111", "#222"] },
    profit: { light: ["#fff", "#eee"], dark: ["#111", "#222"] },
    cashFlow: { light: ["#fff", "#eee"], dark: ["#111", "#222"] },
  }),
  useIsDark: () => false,
}));

const query = (data: unknown) => ({ data, refetch: jest.fn(), isLoading: false, isFetching: false, error: null });

describe("ReportsScreen currency and conversion certainty", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(currencies.useCurrenciesWithPrimaryQuery).mockReturnValue(query({
      currencies: [{ id: 20, code: "EUR", symbol: "€", name: "Euro", isActive: true }], primaryCurrencyId: 20,
    }) as any);
    jest.mocked(reports.useReportsDailyReportQuery).mockReturnValue(query({
      profit: { net: 900, margin: 1000, marginProfit: 1000 },
      transactions: { total: 2, compras: 1, ventas: 1, totalCompras: 100, totalVentas: 200 },
      expenses: { totalAmount: 100, total: 1, totalAmountInCup: null, unconvertedCount: 1, byCategory: {} },
    }) as any);
    jest.mocked(reports.useReportsCashBalancesQuery).mockReturnValue(query([]) as any);
    jest.mocked(reports.useReportsPeriodQuery).mockReturnValue(query({
      summary: { totalTransactions: 2, totalExpensesCount: 1, totalExpensesAmount: 100, totalExpensesInCup: null, unconvertedExpensesCount: 1, marginProfit: 1000, netProfit: 900 },
      dailyBreakdown: [], transactionsByCurrency: {}, expensesByCurrency: {},
    }) as any);
    jest.mocked(reports.useReportsProfitQuery).mockReturnValue(query(null) as any);
    jest.mocked(reports.useReportsCashFlowQuery).mockReturnValue(query(null) as any);
  });

  it("does not present partial daily net profit as an exact amount", () => {
    const { getByText, queryByText } = render(<ReportsScreen />);

    expect(getByText("Ganancia Neta")).toBeTruthy();
    expect(getByText("No disponible: hay conversiones pendientes")).toBeTruthy();
    expect(queryByText("€ 900.00")).toBeNull();
  });

  it("does not present partial period net profit as exact", () => {
    const { getByText, queryByText } = render(<ReportsScreen />);
    fireEvent.press(getByText("Por Período"));

    expect(getByText("No disponible: hay conversiones pendientes")).toBeTruthy();
    expect(queryByText("€ 900.00")).toBeNull();
  });
});
