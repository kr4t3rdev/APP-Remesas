import React from "react";
import { act, render } from "@testing-library/react-native";
import { ScrollView, TouchableOpacity } from "react-native";
import { HomeScreen } from "./HomeScreen";
import { colors, darkColors } from "../../theme";

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
    accent: { 500: "#f70", 800: "#730" },
    text: { primary: "#111", secondary: "#555", tertiary: "#888" },
    currencies: {
      usd: { primary: "#080", bg: "#efe" },
      eur: { primary: "#00f", bg: "#eef" },
      mlc: { primary: "#808", bg: "#fef" },
      cup: { primary: "#800", bg: "#fee" },
    },
    financial: {
      compra: "#d00",
      compraForeground: "#730",
      compraLight: "#fee",
      venta: "#080",
      ventaForeground: "#053",
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
  ScaleIn: ({ children, style }: { children: React.ReactNode; style?: object }) => {
    const { View } = require("react-native");
    return (
      <View testID={style ? "scale-in-grid-item" : undefined} style={style}>
        {children}
      </View>
    );
  },
  PressableScale: ({ children }: { children: React.ReactNode }) => children,
  LoadingDots: () => null,
}));

jest.mock("../../components/charts/Charts", () => {
  const { Text, View } = require("react-native");

  return {
    StatsCard: ({ title, value, subtitle, color, style }: Record<string, any>) => (
      <View testID="home-real-kpi-card" style={style}>
        <Text>{title}</Text>
        <Text style={{ color }}>{value}</Text>
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

const relativeLuminance = (hex: string) => {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

describe("HomeScreen dashboard content contract", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 14, 9));
    mockUseTabScrollToTop.mockClear();
    mockUseDashboardData.mockReturnValue(dashboardData);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the current dashboard content without Business", () => {
    const { getByText, queryByText } = render(<HomeScreen />);

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
    expect(queryByText("Ver todo")).toBeNull();
    expect(queryByText(/Business|Negocio|Empresa/i)).toBeNull();
  });

  it("uses the petroleum palette in light and dark themes", () => {
    expect(colors.primary[500]).toBe("#0E7490");
    expect(colors.primary[600]).toBe("#155E75");
    expect(darkColors.primary[500]).toBe("#22D3EE");
    expect(darkColors.primary[600]).toBe("#67E8F9");
    expect(colors.text.tertiary).toBe("#526C72");
  });

  it("keeps semantic financial text foregrounds readable on cards", () => {
    expect(
      contrastRatio(colors.financial.compraForeground, colors.card),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(colors.financial.ventaForeground, colors.card),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(darkColors.financial.compraForeground, darkColors.card),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(darkColors.financial.ventaForeground, darkColors.card),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.accent[800], colors.card)).toBeGreaterThanOrEqual(
      3,
    );
    expect(
      contrastRatio(darkColors.accent[800], darkColors.card),
    ).toBeGreaterThanOrEqual(3);
  });

  it("renders the four KPIs in one wrapping two-column grid", () => {
    const { getByTestId, getAllByTestId } = render(<HomeScreen />);

    expect(getByTestId("home-kpi-grid")).toHaveStyle({
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    });
    expect(getAllByTestId("scale-in-grid-item")).toHaveLength(4);
    getAllByTestId("scale-in-grid-item").forEach((item) => {
      expect(item).toHaveStyle({ flexBasis: "47%", minHeight: 136 });
    });
    getAllByTestId("home-real-kpi-card").forEach((card) => {
      expect(card).toHaveStyle({ minWidth: 0 });
    });
  });

  it("uses theme-aware foregrounds for currency symbols", () => {
    const { getAllByText } = render(<HomeScreen />);

    getAllByText("$").forEach((symbol) => {
      expect(symbol).toHaveStyle({ color: "#111" });
    });
  });

  it("uses semantic foreground tokens for financial text", () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText("320.00")).toHaveStyle({ color: "#730" });
    expect(getByText("325.00")).toHaveStyle({ color: "#053" });
    expect(getByText("-$ 32,000.00")).toHaveStyle({ color: "#730" });
    expect(getByText("7")).toHaveStyle({ color: "#053" });
    expect(getByText("$ 406,250.00")).toHaveStyle({ color: "#730" });
  });

  it("renders known inert Home surfaces without touchable semantics", () => {
    const { getByTestId, getByText, queryByLabelText, UNSAFE_queryAllByType } = render(
      <HomeScreen />,
    );

    expect(getByTestId("home-notification-indicator")).not.toHaveStyle({
      backgroundColor: "#fff",
    });
    expect(queryByLabelText("Notificaciones")).toBeNull();
    expect(getByText("1,250.00")).toBeTruthy();
    expect(getByText("Compra de USD")).toBeTruthy();
    expect(UNSAFE_queryAllByType(TouchableOpacity)).toHaveLength(0);
  });

  it("registers Home scroll-to-top integration", () => {
    const { UNSAFE_getAllByType } = render(<HomeScreen />);
    const scrollTo = jest.fn();
    UNSAFE_getAllByType(ScrollView)[0].instance.scrollTo = scrollTo;

    expect(mockUseTabScrollToTop).toHaveBeenCalledWith(
      "Home",
      expect.any(Function),
    );

    const scrollToTop = mockUseTabScrollToTop.mock.calls[0][1];
    act(() => scrollToTop());

    expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
  });

  it("shows an instructive empty state when there are no active objectives", () => {
    mockUseDashboardData.mockReturnValue({
      ...dashboardData,
      activeObjectives: [],
      summary: {
        ...dashboardData.summary,
        transactionSummary: {
          ...dashboardData.summary.transactionSummary,
          comprasCount: 0,
          ventasCount: 0,
        },
      },
    });

    const { queryByText } = render(<HomeScreen />);

    expect(queryByText("Objetivos")).toBeTruthy();
    expect(queryByText("Todavía no tenés objetivos activos")).toBeTruthy();
    expect(queryByText("Creá un objetivo para seguir tu progreso")).toBeTruthy();
  });

  it("keeps balances horizontal only when balances exist", () => {
    const populated = render(<HomeScreen />);
    expect(populated.getByTestId("home-balances-content")).toHaveProp("horizontal", true);

    mockUseDashboardData.mockReturnValue({ ...dashboardData, cashBalances: [] });
    const empty = render(<HomeScreen />);
    expect(empty.getByTestId("home-balances-content")).not.toHaveProp("horizontal");
    expect(empty.getByTestId("home-balances-content")).toHaveStyle({ width: "100%" });
    expect(empty.getByText("No hay balances para mostrar")).toBeTruthy();
  });

  it("uses instructive empty states and accessible non-interactive status", () => {
    mockUseDashboardData.mockReturnValue({
      ...dashboardData,
      cashBalances: [],
      exchangeRates: [],
      recentTransactions: [],
      activeObjectives: [],
      summary: {
        ...dashboardData.summary,
        transactionSummary: {
          ...dashboardData.summary.transactionSummary,
          comprasCount: 0,
          ventasCount: 0,
        },
      },
    });

    const { getByLabelText, getByText, getAllByTestId } = render(<HomeScreen />);

    expect(getByLabelText("Notificaciones pendientes")).toBeTruthy();
    expect(getByText("No hay balances para mostrar")).toBeTruthy();
    expect(getByText("Agregá una caja o cuenta para ver sus saldos")).toBeTruthy();
    expect(getByText("No hay tasas configuradas")).toBeTruthy();
    expect(getByText("Configurá una tasa para comparar compra y venta")).toBeTruthy();
    expect(getByText("No hay actividad para resumir")).toBeTruthy();
    expect(getByText("Registrá transacciones para ver el movimiento del día")).toBeTruthy();
    expect(getByText("No hay transacciones recientes. Registrá una para verla acá.")).toBeTruthy();
    expect(getAllByTestId("home-section-surface").length).toBeGreaterThanOrEqual(4);
  });
});
