import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { TransactionModal } from "../TransactionModal";
import * as transactions from "../../../../modules/transactions/application/useTransactions";

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
    jest.mocked(transactions.useExchangeRatesQuery).mockReturnValue({ data: [
      { currencyId: 1, buyRate: 240, sellRate: 260 },
      { currencyId: 2, buyRate: 280, sellRate: 320 },
    ] } as any);
  });

  it("selects the chosen position and buy rate for COMPRA", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByText("EUR"));
    fireEvent.changeText(getByLabelText("Monto de la transferencia"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ currencyId: 2, rate: 280, type: "COMPRA", idempotencyKey: expect.any(String) }), expect.any(Object));
  });

  it("uses sell rate for VENTA and blocks insufficient sales", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByText("Venta"));
    fireEvent.changeText(getByLabelText("Monto de la transferencia"), "101");
    expect(getByText(/saldo disponible/)).toBeTruthy();
    expect(getByText("Guardar")).toBeDisabled();
    fireEvent.changeText(getByLabelText("Monto de la transferencia"), "10");
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

    fireEvent.changeText(getByLabelText("Monto de la transferencia"), "10");
    expect(getByText(/Saldo proyectado: 110\.00/)).toBeTruthy();
  });
});
