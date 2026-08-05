import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TopWorkersCard } from "./TopWorkersCard";
import type { Worker, ExchangeRate, Currency } from "../../types";

const mockNavigationNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigationNavigate,
  }),
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));

jest.mock("../animations", () => ({
  FadeInDown: ({ children }: { children: React.ReactNode }) => children,
  ScaleIn: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../store/themeStore", () => ({
  useColors: () => ({
    primary: { 500: "#00f" },
    text: { primary: "#111", secondary: "#555", tertiary: "#888" },
    border: "#ddd",
    danger: "#d00",
  }),
}));

describe("TopWorkersCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPrimaryCurrency: Currency = {
    id: 10,
    code: "CUP",
    name: "Peso cubano",
    symbol: "$",
    isActive: true,
  };

  const mockRates: ExchangeRate[] = [
    {
      id: 1,
      currencyId: 1, // USD
      currency: { id: 1, code: "USD", name: "Dólar", symbol: "$", isActive: true },
      referenceRate: 120,
      buyMargin: 0,
      sellMargin: 0,
      buyRate: 118,
      sellRate: 120,
      effectiveDate: "2026-07-14",
    },
  ];

  const mockWorkers: Worker[] = [
    {
      id: 1,
      name: "Juan Perez",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 10,
          workerId: 1,
          currencyId: 10, // CUP
          balance: 1000,
          accumulatedProfit: 0,
          totalDelivered: 1000,
        },
      ],
    },
    {
      id: 2,
      name: "Ana Gomez",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 20,
          workerId: 2,
          currencyId: 1, // USD (10 * 120 = 1200 CUP)
          balance: 10,
          accumulatedProfit: 0,
          totalDelivered: 10,
        },
      ],
    },
  ];

  it("renders a list of top workers correctly ranked", () => {
    const { getByText, queryByTestId } = render(
      <TopWorkersCard
        workers={mockWorkers}
        rates={mockRates}
        primaryCurrency={mockPrimaryCurrency}
      />
    );

    expect(getByText("Rendimiento de Trabajadores")).toBeTruthy();
    expect(getByText("Ranking por Saldo Acumulado (CUP)")).toBeTruthy();

    // Ana Gomez should be #1 (1200 CUP)
    expect(getByText("Ana Gomez")).toBeTruthy();
    expect(getByText("$ 1,200.00")).toBeTruthy();

    // Juan Perez should be #2 (1000 CUP)
    expect(getByText("Juan Perez")).toBeTruthy();
    expect(getByText("$ 1,000.00")).toBeTruthy();

    expect(queryByTestId("unconverted-warning")).toBeNull();
  });

  it("shows empty state when no workers", () => {
    const { getByText, getByTestId } = render(
      <TopWorkersCard
        workers={[]}
        rates={mockRates}
        primaryCurrency={mockPrimaryCurrency}
      />
    );

    expect(getByTestId("top-workers-empty")).toBeTruthy();
    expect(getByText("No hay trabajadores con saldo registrado para mostrar.")).toBeTruthy();
  });

  it("triggers navigation when 'Ver todo' is pressed", () => {
    const { getByTestId } = render(
      <TopWorkersCard
        workers={mockWorkers}
        rates={mockRates}
        primaryCurrency={mockPrimaryCurrency}
      />
    );

    const seeAllBtn = getByTestId("top-workers-see-all");
    fireEvent.press(seeAllBtn);

    expect(mockNavigationNavigate).toHaveBeenCalledWith("BusinessWorkers");
  });

  it("shows warning badge when a worker has an unconverted balance", () => {
    const workerWithUnconverted: Worker = {
      id: 3,
      name: "Sin Tasa",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 30,
          workerId: 3,
          currencyId: 99, // Unkonwn currency
          balance: 10,
          accumulatedProfit: 0,
          totalDelivered: 10,
        },
      ],
    };

    const { getByTestId } = render(
      <TopWorkersCard
        workers={[workerWithUnconverted]}
        rates={mockRates}
        primaryCurrency={mockPrimaryCurrency}
      />
    );

    expect(getByTestId("unconverted-warning")).toBeTruthy();
  });
});
