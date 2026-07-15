import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { TransactionModal } from "../TransactionModal";
import * as transactions from "../../../../modules/transactions/application/useTransactions";
import * as banks from "../../../../modules/bank-accounts/application/useBankAccounts";
import * as cash from "../../../../modules/cash/application/useCash";
jest.mock("../../../../modules/bank-accounts/application/useBankAccounts");
jest.mock("../../../../modules/cash/application/useCash");

jest.mock("../../../../modules/transactions/application/useTransactions");

describe("TransactionModal FX intent", () => {
  const mutate = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(transactions.useCreateTransactionMutation).mockReturnValue({ mutate, isPending: false } as any);
    jest.mocked(transactions.usePositionsQuery).mockReturnValue({ data: [
      { currencyId: 1, currency: { code: "USD" }, saldo: 100, costoPromedio: 250, availableForSale: true },
      { currencyId: 2, currency: { code: "EUR" }, saldo: 40, costoPromedio: 300, availableForSale: true },
    ] } as any);
    jest.mocked(transactions.useCurrenciesQuery).mockReturnValue({ data: [{ id: 1, code: "CUP" }, { id: 2, code: "USD" }] } as any);
    jest.mocked(banks.useBankAccountsQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(transactions.useExchangeRatesQuery).mockReturnValue({ data: [
      { currencyId: 1, buyRate: 240, sellRate: 260 },
      { currencyId: 2, buyRate: 280, sellRate: 320 },
    ] } as any);
  });

  it("selects the chosen position and buy rate for COMPRA", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByText("EUR"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ currencyId: 2, rate: 280, type: "COMPRA", idempotencyKey: expect.any(String) }), expect.any(Object));
  });

  it("uses sell rate for VENTA and blocks insufficient sales", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByText("Venta"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "101");
    expect(getByText(/saldo disponible/)).toBeTruthy();
    expect(getByText("Guardar")).toBeDisabled();
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ currencyId: 1, rate: 260, type: "VENTA" }), expect.any(Object));
  });

  it("selects the first loaded position when positions arrive after the initial render", () => {
    jest.mocked(transactions.usePositionsQuery).mockReturnValue({ data: [] } as any);
    const { rerender, getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);

    jest.mocked(transactions.usePositionsQuery).mockReturnValue({ data: [
      { currencyId: 1, currency: { code: "USD" }, saldo: 100, costoPromedio: 250, availableForSale: true },
    ] } as any);
    rerender(<TransactionModal visible onClose={jest.fn()} />);

    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    expect(getByText(/Saldo proyectado: 110\.00/)).toBeTruthy();
  });

  it("shows success feedback after saving the operation", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    const options = mutate.mock.calls[0][1];
    act(() => options.onSuccess());

    expect(getByText("Operación guardada correctamente.")).toBeTruthy();
  });

  it("shows error feedback when saving the operation fails", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    const options = mutate.mock.calls[0][1];
    act(() => options.onError(new Error("offline")));

    expect(getByText("No se pudo guardar la operación. Intentá nuevamente.")).toBeTruthy();
  });
});
