import React from "react";
import { render } from "@testing-library/react-native";
import { HomeScreen } from "./HomeScreen";

const mockUseDashboardData = jest.fn();
const mockUseTabScrollToTop = jest.fn();

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));

jest.mock("../../hooks/useDashboardData", () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

jest.mock("../../store/authStore", () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({ user: { name: "Ada" } }),
}));

jest.mock("../../store/themeStore", () => ({
  useColors: () => ({
    background: "#fff",
    card: "#fff",
    border: "#ddd",
    primary: { 500: "#00f" },
    secondary: { 500: "#70f" },
    accent: { 500: "#f70" },
    text: { primary: "#111", secondary: "#555", tertiary: "#888" },
    currencies: {
      usd: { primary: "#080", bg: "#efe" },
      eur: { primary: "#00f", bg: "#eef" },
      mlc: { primary: "#808", bg: "#fef" },
      cup: { primary: "#800", bg: "#fee" },
    },
    financial: {
      compra: "#d00",
      compraLight: "#fee",
      venta: "#080",
      ventaLight: "#efe",
    },
    danger: "#d00",
    success: "#080",
  }),
  useShadows: () => ({ sm: {}, md: {} }),
  useIsDark: () => false,
  useGradients: () => ({}),
}));

jest.mock("../../navigation/TabBarMotionProvider", () => ({
  useTabBarScrollBehavior: () => ({
    onScroll: jest.fn(),
    scrollEventThrottle: 16,
  }),
  useTabScrollToTop: (...args: unknown[]) => mockUseTabScrollToTop(...args),
}));

jest.mock("../../components/animations", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
  FadeInDown: ({ children }: { children: React.ReactNode }) => children,
  ScaleIn: ({ children }: { children: React.ReactNode }) => children,
  PressableScale: ({ children }: { children: React.ReactNode }) => children,
  LoadingDots: () => null,
}));

jest.mock("../../components/charts/Charts", () => {
  const { Text, View } = require("react-native");

  return {
    StatsCard: ({ title, value, subtitle }: Record<string, string>) => (
      <View>
        <Text>{title}</Text>
        <Text>{value}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
      </View>
    ),
    BarChart: ({ data }: { data: Array<{ label: string; value: number }> }) => (
      <View>
        {data.map((item) => (
          <Text key={item.label}>{`${item.label}: ${item.value}`}</Text>
        ))}
      </View>
    ),
    CircularProgress: ({ children }: { children: React.ReactNode }) => children,
  };
});

const dashboardData = {
  dailyReport: {},
  cashBalances: [
    {
      id: "cash-usd",
      balance: 1250,
      currency: { code: "USD", symbol: "$", name: "Dólar" },
    },
  ],
  exchangeRates: [
    {
      id: "rate-usd",
      buyRate: 320,
      sellRate: 325,
      currency: { code: "USD", symbol: "$", name: "Dólar estadounidense" },
    },
  ],
  recentTransactions: [
    {
      id: "tx-1",
      type: "COMPRA",
      amount: 100,
      rate: 320,
      totalCup: 32000,
      createdAt: "2026-07-14T13:30:00.000Z",
      currency: { code: "USD" },
    },
  ],
  activeObjectives: [
    {
      id: "objective-1",
      name: "Fondo de emergencia",
      percentage: 50,
      currentAmount: 500,
      targetAmount: 1000,
      currency: { symbol: "USD" },
    },
  ],
  isLoading: false,
  isRefreshing: false,
  refetchAll: jest.fn(),
  summary: {
    todayProfit: 2500,
    todayTransactions: 7,
    todayExpenses: 300,
    totalCashBalance: 406250,
    transactionSummary: {
      compras: 0,
      ventas: 0,
      comprasCount: 3,
      ventasCount: 4,
    },
    expensesByCategory: {},
  },
};

describe("HomeScreen dashboard content contract", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-14T14:00:00.000Z"));
    mockUseDashboardData.mockReturnValue(dashboardData);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the current dashboard content without Business", () => {
    const { getByText, getAllByText, queryByText } = render(<HomeScreen />);

    expect(getByText("Buenos días")).toBeTruthy();
    expect(getByText("Ada")).toBeTruthy();
    expect(getByText("Hoy")).toBeTruthy();
    expect(getByText("14 de julio, 2026")).toBeTruthy();

    expect(getByText("Ganancia Hoy")).toBeTruthy();
    expect(getByText("$ 2,500.00")).toBeTruthy();
    expect(getByText("Transacciones")).toBeTruthy();
    expect(getByText("7")).toBeTruthy();
    expect(getByText("3 compras, 4 ventas")).toBeTruthy();
    expect(getByText("Gastos Hoy")).toBeTruthy();
    expect(getByText("$ 300.00")).toBeTruthy();
    expect(getByText("Balance Caja")).toBeTruthy();
    expect(getByText("$ 406,250.00")).toBeTruthy();

    expect(getByText("Balances por Moneda")).toBeTruthy();
    expect(getByText("USD")).toBeTruthy();
    expect(getByText("1,250.00")).toBeTruthy();
    expect(getByText("Tasas de Cambio")).toBeTruthy();
    expect(getByText("Dólar estadounidense")).toBeTruthy();
    expect(getByText("320.00")).toBeTruthy();
    expect(getByText("325.00")).toBeTruthy();

    expect(getByText("Resumen de Actividad")).toBeTruthy();
    expect(getByText("Compras vs Ventas")).toBeTruthy();
    expect(getByText("Compras: 3")).toBeTruthy();
    expect(getByText("Ventas: 4")).toBeTruthy();
    expect(getByText("Objetivos")).toBeTruthy();
    expect(getByText("Fondo de emergencia")).toBeTruthy();
    expect(getByText("50%")).toBeTruthy();
    expect(getByText("Actividad Reciente")).toBeTruthy();
    expect(getByText("Compra de USD")).toBeTruthy();
    expect(getByText("100 USD")).toBeTruthy();
    expect(getByText("-$ 32,000.00")).toBeTruthy();
    expect(getAllByText("Ver todo")).toHaveLength(4);

    expect(queryByText(/Business/i)).toBeNull();
  });

  it("registers Home scroll-to-top integration", () => {
    render(<HomeScreen />);

    expect(mockUseTabScrollToTop).toHaveBeenCalledWith(
      "Home",
      expect.any(Function),
    );
  });

  it("hides objectives when there are no active objectives", () => {
    mockUseDashboardData.mockReturnValue({
      ...dashboardData,
      activeObjectives: [],
    });

    const { queryByText } = render(<HomeScreen />);

    expect(queryByText("Objetivos")).toBeNull();
    expect(queryByText("Fondo de emergencia")).toBeNull();
  });
});
