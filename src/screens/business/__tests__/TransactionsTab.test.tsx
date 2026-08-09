import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { TransactionsTab } from "../tabs/TransactionsTab";
import * as transactionQueries from "../../../modules/transactions/application/useTransactions";
import * as cashQueries from "../../../modules/cash/application/useCash";
import * as currencyQueries from "../../../modules/currencies/application/useCurrencies";

jest.mock("../../../modules/transactions/application/useTransactions");
jest.mock("../../../modules/cash/application/useCash");
jest.mock("../../../modules/currencies/application/useCurrencies");
jest.mock("../../../components/business/modals/TransactionModal", () => ({
  TransactionModal: () => null,
}));

const query = (overrides: Record<string, unknown> = {}) => ({
  data: [],
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("TransactionsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(transactionQueries.useTransactionsQuery).mockReturnValue(query() as any);
    jest.mocked(transactionQueries.usePositionsQuery).mockReturnValue(query() as any);
    jest.mocked(transactionQueries.useRemittancesQuery).mockReturnValue(query() as any);
    jest.mocked(transactionQueries.useOpenPositionMutation).mockReturnValue({ mutateAsync: jest.fn(), isPending: false } as any);
    jest.mocked(cashQueries.useCashBalancesQuery).mockReturnValue(query() as any);
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue(query({
      data: { currencies: [{ id: 10, code: "CUP", symbol: "$", isActive: true }], primaryCurrencyId: 10 },
    }) as any);
  });

  it("renders the loading state for the combined FX resources", () => {
    jest.mocked(transactionQueries.usePositionsQuery).mockReturnValue(query({ isLoading: true }) as any);

    const { getByLabelText } = render(<TransactionsTab />);

    expect(getByLabelText("Cargando transacciones")).toBeTruthy();
  });

  it("renders the intended FX summary instead of the removed TransactionCard contract", () => {
    jest.mocked(transactionQueries.usePositionsQuery).mockReturnValue(query({
      data: [{ currencyId: 1, currency: { code: "USD" }, saldo: 100, costoPromedio: 250, availableForSale: true }],
    }) as any);
    jest.mocked(transactionQueries.useTransactionsQuery).mockReturnValue(query({
      data: [{ id: 1, type: "VENTA", currency: { code: "USD" }, amount: 10, rate: 260, marginProfit: 100 }],
    }) as any);
    jest.mocked(transactionQueries.useRemittancesQuery).mockReturnValue(query({
      data: [{ id: 4, provider: "Acme", sourceId: "source-4", status: "PENDING", duplicate: true }],
    }) as any);

    const { getByText, queryByText } = render(<TransactionsTab />);

    expect(getByText("Posiciones")).toBeTruthy();
    expect(getByText("Remesas")).toBeTruthy();
    expect(getByText("Operaciones")).toBeTruthy();
    expect(getByText("Saldo: 100.00 · Costo promedio: 250.00")).toBeTruthy();
    expect(getByText("Venta · USD")).toBeTruthy();
    expect(getByText("Rendimiento: 100.00")).toBeTruthy();
    expect(getByText("Acme · PENDING · duplicada segura")).toBeTruthy();
    expect(queryByText("Currency Exchange")).toBeNull();
    expect(queryByText("BUY")).toBeNull();
  });

  it("renders empty state and recovers all resources on retry", async () => {
    const refetchTransactions = jest.fn().mockResolvedValue(undefined);
    const refetchPositions = jest.fn().mockResolvedValue(undefined);
    const refetchRemittances = jest.fn().mockResolvedValue(undefined);
    jest.mocked(transactionQueries.useTransactionsQuery).mockReturnValue(query({ error: new Error("offline"), refetch: refetchTransactions }) as any);
    jest.mocked(transactionQueries.usePositionsQuery).mockReturnValue(query({ refetch: refetchPositions }) as any);
    jest.mocked(transactionQueries.useRemittancesQuery).mockReturnValue(query({ refetch: refetchRemittances }) as any);

    const { getByRole } = render(<TransactionsTab />);
    fireEvent.press(getByRole("button", { name: "Reintentar" }));

    expect(refetchTransactions).toHaveBeenCalled();
    expect(refetchPositions).toHaveBeenCalled();
    expect(refetchRemittances).toHaveBeenCalled();
  });

  it("renders manual remittances with the API's nullable provider and string id", () => {
    jest.mocked(transactionQueries.useRemittancesQuery).mockReturnValue(query({
      data: [{ id: "transaction:9", provider: null, sourceId: null, status: "COMPLETED", origin: "MANUAL" }],
    }) as any);

    const { getByText } = render(<TransactionsTab />);

    expect(getByText("Manual · COMPLETED")).toBeTruthy();
  });

  it("exposes controlled opening when a currency has historical cash", () => {
    jest.mocked(cashQueries.useCashBalancesQuery).mockReturnValue(query({
      data: [{ currencyId: 2, currency: { id: 2, code: "USD", name: "US Dollar", symbol: "$", isActive: true }, balance: 50 }],
    }) as any);

    const { getByRole } = render(<TransactionsTab />);

    expect(getByRole("button", { name: "Abrir posición histórica" })).toBeTruthy();
  });

  it("keeps an existing UNREVIEWED position available for controlled review", () => {
    jest.mocked(transactionQueries.usePositionsQuery).mockReturnValue(query({
      data: [{ currencyId: 2, currency: { code: "USD" }, saldo: 50, costoPromedio: null, availableForSale: false, reviewStatus: "UNREVIEWED" }],
    }) as any);
    jest.mocked(cashQueries.useCashBalancesQuery).mockReturnValue(query({
      data: [{ currencyId: 2, currency: { id: 2, code: "USD", name: "US Dollar", symbol: "$", isActive: true }, balance: 50 }],
    }) as any);

    const { getByRole, getByText } = render(<TransactionsTab />);

    expect(getByText("Pendiente de revisión")).toBeTruthy();
    expect(getByRole("button", { name: "Abrir posición histórica" })).toBeTruthy();
  });
});
