import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { CashScreen } from "../CashScreen";

const mockNavigate = jest.fn();
const mockRefetch = jest.fn();
const mockCreateAudit = jest.fn();
const mockCreateAdjustment = jest.fn();
const mockAlert = jest.fn();

const mockCup = { id: 1, code: "CUP", name: "Peso cubano", symbol: "$", isActive: true };
const mockUsd = { id: 2, code: "USD", name: "Dólar estadounidense", symbol: "US$", isActive: true };

let mockOverviewQuery: Record<string, unknown>;
let mockCurrencyList: typeof mockCup[];
let mockCurrenciesWithPrimary: { primaryCurrencyId: number; currencies: typeof mockCup[] } | undefined;

const mockPopulatedOverview = {
  asOf: "2026-07-14T12:00:00.000Z",
  primaryCurrency: mockCup,
  currencies: [mockCup, mockUsd],
  balances: [{ id: 10, currencyId: 1, balance: 1500.5, currency: mockCup }],
  recentMovements: [{
    id: "adjustment-1",
    kind: "ADJUSTMENT",
    type: "INGRESO",
    direction: "IN",
    title: "Ajuste manual",
    description: "Fondo inicial",
    amount: 50,
    totalBase: null,
    currency: mockUsd,
    createdAt: "2026-07-14T11:00:00.000Z",
  }],
  latestAudits: [{
    id: 20,
    currencyId: 1,
    currency: mockCup,
    expectedBalance: 1500,
    actualBalance: 1490,
    difference: -10,
    notes: "Conteo de cierre",
    createdAt: "2026-07-14T10:00:00.000Z",
  }],
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return { Ionicons: ({ name }: { name: string }) => React.createElement(Text, null, name) };
});

jest.mock("../../../components/animations", () => {
  const React = require("react");
  const { TouchableOpacity, View } = require("react-native");
  return {
    FadeIn: ({ children }: any) => React.createElement(View, null, children),
    FadeInDown: ({ children }: any) => React.createElement(View, null, children),
    FadeInOverlay: () => React.createElement(View),
    ScaleIn: ({ children }: any) => React.createElement(View, null, children),
    PressableScale: ({ children, onPress, ...props }: any) =>
      React.createElement(TouchableOpacity, { onPress, ...props }, children),
  };
});

jest.mock("../../../navigation/TabBarMotionProvider", () => ({
  useTabBarScrollBehavior: () => ({ onScroll: jest.fn(), scrollEventThrottle: 16 }),
  useTabScrollToTop: jest.fn(),
}));

jest.mock("../../../utils/alert", () => ({
  Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));

jest.mock("../../../modules/cash/application/useCash", () => ({
  useCashOverviewQuery: () => mockOverviewQuery,
  useCreateCashAuditMutation: () => ({ mutateAsync: mockCreateAudit, isPending: false }),
  useCreateCashAdjustmentMutation: () => ({ mutateAsync: mockCreateAdjustment, isPending: false }),
}));

jest.mock("../../../modules/currencies/application/useCurrencies", () => ({
  useCurrenciesQuery: () => ({ data: mockCurrencyList }),
  useCurrenciesWithPrimaryQuery: () => ({ data: mockCurrenciesWithPrimary }),
}));

jest.mock("../../../modules/bank-accounts/application/useBankAccounts", () => ({
  useBankAccountsQuery: () => ({ data: [] }),
}));

jest.mock("../../../modules/exchange-rates/application/useExchangeRates", () => ({
  useCurrentExchangeRatesQuery: () => ({ data: [] }),
}));

jest.mock("../../../modules/objectives/application/useObjectives", () => ({
  useObjectivesQuery: () => ({ data: [] }),
}));

describe("CashScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverviewQuery = {
      data: mockPopulatedOverview,
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: mockRefetch,
    };
    mockCurrencyList = [mockCup, mockUsd];
    mockCurrenciesWithPrimary = { primaryCurrencyId: 1, currencies: [mockCup, mockUsd] };
  });

  it("renders overview balances, movements and latest audit without misleading cross-currency totals", () => {
    const { getByText, queryByText } = render(<CashScreen />);

    expect(getByText("$ 1,500.50")).toBeTruthy();
    expect(getByText("Ajuste manual")).toBeTruthy();
    expect(getByText("Faltante")).toBeTruthy();
    expect(queryByText("Total en Caja")).toBeNull();
    expect(queryByText("Distribución")).toBeNull();
  });

  it("opens CashHistory from the recent movements link", () => {
    const { getByText } = render(<CashScreen />);

    fireEvent.press(getByText("Ver historial"));

    expect(mockNavigate).toHaveBeenCalledWith("CashHistory");
  });

  it("allows an active currency without a balance in an adjustment", async () => {
    mockCreateAdjustment.mockResolvedValueOnce(undefined);
    const { getByText, getAllByText, getByPlaceholderText } = render(<CashScreen />);

    fireEvent.press(getByText("Ajuste Manual"));
    fireEvent.press(getAllByText("USD").at(-1)!);
    fireEvent.changeText(getByPlaceholderText("0.00"), "25.50");
    fireEvent.changeText(getByPlaceholderText("Motivo del ajuste"), "Fondo USD");
    await act(async () => {
      fireEvent.press(getByText("Guardar ajuste"));
    });

    expect(mockCreateAdjustment).toHaveBeenCalledWith({
      currencyId: 2,
      amount: 25.5,
      type: "INGRESO",
      reason: "Fondo USD",
    });
    expect(getByText("Acciones rápidas")).toBeTruthy();
  }, 15000);

  it("rejects invalid audit values", () => {
    const { getByText, getByPlaceholderText } = render(<CashScreen />);

    fireEvent.press(getByText("Arqueo de Caja"));
    fireEvent.changeText(getByPlaceholderText("0.00"), "-1");
    fireEvent.press(getByText("Guardar arqueo"));

    expect(mockCreateAudit).not.toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith("Error", "Ingresa un saldo real válido");
  });

  it.each(["", "   "])("rejects a blank audit amount (%p)", (blankAmount) => {
    const { getByText, getByPlaceholderText } = render(<CashScreen />);

    fireEvent.press(getByText("Arqueo de Caja"));
    fireEvent.changeText(getByPlaceholderText("0.00"), blankAmount);
    fireEvent.press(getByText("Guardar arqueo"));

    expect(mockCreateAudit).not.toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith("Error", "Ingresa un saldo real válido");
  });

  it("labels converted movement amounts with the primary currency", () => {
    mockOverviewQuery = {
      ...mockOverviewQuery,
      data: {
        ...mockPopulatedOverview,
        recentMovements: [{ ...mockPopulatedOverview.recentMovements[0], totalBase: 125 }],
      },
    };
    const { getByText, getAllByText } = render(<CashScreen />);

    expect(getByText("+$125.00")).toBeTruthy();
    expect(getAllByText("CUP").length).toBeGreaterThan(1);
  });

  it("falls back to overview currencies when currency queries return placeholder arrays", () => {
    mockCurrencyList = [];
    mockCurrenciesWithPrimary = { primaryCurrencyId: 1, currencies: [] };
    const { getByText } = render(<CashScreen />);

    fireEvent.press(getByText("Ajuste Manual"));

    expect(getByText("USD")).toBeTruthy();
    expect(getByText("CUP")).toBeTruthy();
  });

  it("shows an error state and retries the overview query", () => {
    mockOverviewQuery = { ...mockOverviewQuery, data: undefined, isError: true };
    const { getByText } = render(<CashScreen />);

    fireEvent.press(getByText("Reintentar"));

    expect(getByText("No se pudo cargar Caja")).toBeTruthy();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("shows loading and empty states", () => {
    mockOverviewQuery = { ...mockOverviewQuery, data: undefined, isLoading: true };
    const loading = render(<CashScreen />);
    expect(loading.getByTestId("cash-loading")).toBeTruthy();
    loading.unmount();

    mockOverviewQuery = {
      ...mockOverviewQuery,
      isLoading: false,
      data: { ...mockPopulatedOverview, balances: [], recentMovements: [], latestAudits: [] },
    };
    const empty = render(<CashScreen />);
    expect(empty.getByText("Caja sin saldos")).toBeTruthy();
  });
});
