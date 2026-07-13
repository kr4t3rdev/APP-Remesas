import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { TransactionsTab } from "../tabs/TransactionsTab";
import * as transactionQueries from "../../../modules/transactions/application/useTransactions";

jest.mock("../../../modules/transactions/application/useTransactions");
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
      data: [{ id: 1, type: "VENTA", currency: { code: "USD" }, amount: 10, rate: 260, marginProfit: 100, status: "RECONCILIADO" }],
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
});
