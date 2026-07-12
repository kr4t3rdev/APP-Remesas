import React from "react";
import { render } from "@testing-library/react-native";
import { CashRegisterTab } from "../tabs/CashRegisterTab";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock("../../../modules/cash/application/useCash", () => ({
  useCashOverviewQuery: () => ({
    data: {
      asOf: "2026-07-11T12:00:00.000Z",
      primaryCurrency: {
        id: 1,
        code: "CUP",
        name: "Peso cubano",
        symbol: "$",
        isActive: true,
      },
      currencies: [
        {
          id: 1,
          code: "CUP",
          name: "Peso cubano",
          symbol: "$",
          isActive: true,
        },
      ],
      balances: [
        {
          id: 1,
          currencyId: 1,
          balance: 1500.5,
          currency: {
            id: 1,
            code: "CUP",
            name: "Peso cubano",
            symbol: "$",
            isActive: true,
          },
        },
      ],
      recentMovements: [],
      latestAudits: [],
    },
    isLoading: false,
    isRefetching: false,
    refetch: jest.fn(),
  }),
  useCreateCashAuditMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useCreateCashAdjustmentMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("../../../modules/currencies/application/useCurrencies", () => ({
  useCurrenciesQuery: () => ({
    data: [
      {
        id: 1,
        code: "CUP",
        name: "Peso cubano",
        symbol: "$",
        isActive: true,
      },
    ],
  }),
  useCurrenciesWithPrimaryQuery: () => ({
    data: {
      primaryCurrencyId: 1,
      currencies: [
        {
          id: 1,
          code: "CUP",
          name: "Peso cubano",
          symbol: "$",
          isActive: true,
        },
      ],
    },
  }),
}));

describe("CashRegisterTab", () => {
  it("renders real balances instead of mock liquid-asset content", () => {
    const { getByText, queryByText } = render(<CashRegisterTab />);

    expect(getByText("Saldos por moneda")).toBeTruthy();
    expect(getByText("$ 1,500.50")).toBeTruthy();
    expect(queryByText("TOTAL LIQUID ASSETS")).toBeNull();
  });
});
