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
    jest.mocked(transactions.useCurrenciesQuery).mockReturnValue({ data: [{ id: 10, code: "CUP", isActive: true }, { id: 1, code: "USD", isActive: true }, { id: 2, code: "EUR", isActive: true }] } as any);
    jest.mocked(banks.useBankAccountsQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [{ currencyId: 10, currency: { code: "CUP" }, balance: 10000 }, { currencyId: 1, currency: { code: "USD" }, balance: 100 }] } as any);
    jest.mocked(transactions.useExchangeRatesQuery).mockReturnValue({ data: [
      { currencyId: 1, buyRate: 240, sellRate: 260 },
      { currencyId: 2, buyRate: 280, sellRate: 320 },
    ] } as any);
  });

  it("loads available rated currencies into an accessible dropdown", () => {
    const { getByLabelText, queryByLabelText } = render(<TransactionModal visible onClose={jest.fn()} />);

    expect(getByLabelText("Moneda, USD").props.accessibilityState).toEqual({ expanded: false });
    expect(queryByLabelText("EUR")).toBeNull();

    fireEvent.press(getByLabelText("Moneda, USD"));

    expect(getByLabelText("Moneda, USD").props.accessibilityState).toEqual({ expanded: true });
    expect(getByLabelText("USD").props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText("EUR").props.accessibilityState).toEqual({ selected: false });
  });

  it("selects a currency from the dropdown and closes it", () => {
    const { getByLabelText, queryByLabelText } = render(<TransactionModal visible onClose={jest.fn()} />);

    fireEvent.press(getByLabelText("Moneda, USD"));
    fireEvent.press(getByLabelText("EUR"));

    expect(getByLabelText("Moneda, EUR").props.accessibilityState).toEqual({ expanded: false });
    expect(queryByLabelText("USD")).toBeNull();
  });

  it("keeps a long currency list scrollable inside the modal", () => {
    const extraCurrencies = Array.from({ length: 12 }, (_, index) => ({
      id: index + 20,
      code: `FX${index + 1}`,
      isActive: true,
    }));
    jest.mocked(transactions.useCurrenciesQuery).mockReturnValue({ data: [
      { id: 10, code: "CUP", isActive: true },
      ...extraCurrencies,
    ] } as any);
    jest.mocked(transactions.useExchangeRatesQuery).mockReturnValue({ data: extraCurrencies.map((currency, index) => ({
      id: index + 20,
      currencyId: currency.id,
      buyRate: 200 + index,
      sellRate: 210 + index,
    })) } as any);

    const { getByLabelText, getByTestId } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByLabelText("Moneda, FX1"));

    expect(getByTestId("currency-options-scroll").props.style).toEqual(expect.arrayContaining([
      expect.objectContaining({ maxHeight: 220 }),
    ]));
    expect(getByLabelText("FX12")).toBeTruthy();
  });

  it("selects the chosen position and buy rate for COMPRA", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByLabelText("Moneda, USD"));
    fireEvent.press(getByLabelText("EUR"));
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

  it("requires the full base debit for a purchase and rotates idempotency after success", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "50");
    expect(getByText("Guardar")).toBeDisabled();
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    const firstKey = mutate.mock.calls[0][0].idempotencyKey;
    act(() => mutate.mock.calls[0][1].onSuccess());
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate.mock.calls[1][0].idempotencyKey).not.toBe(firstKey);
  });

  it("blocks transfers when the base CUP currency is not configured", () => {
    jest.mocked(transactions.useCurrenciesQuery).mockReturnValue({ data: [{ id: 2, code: "USD" }] } as any);
    const { getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    expect(getByText(/no se encontró la moneda base CUP/i)).toBeTruthy();
    expect(getByText("Guardar")).toBeDisabled();
  });

  it("shows error feedback when saving the operation fails", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    const options = mutate.mock.calls[0][1];
    act(() => options.onError(new Error("offline")));

    expect(getByText("No se pudo guardar la operación. Intentá nuevamente.")).toBeTruthy();
  });

  it("allows buying a rated currency without a previous position or cash balance", () => {
    jest.mocked(transactions.usePositionsQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 10, currency: { code: "CUP" }, balance: 15000 },
    ] } as any);

    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);

    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(getByLabelText("Moneda, USD")).toBeTruthy();
    expect(getByLabelText("Caja · USD")).toBeTruthy();
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "COMPRA", currencyId: 1, sourceType: "CASH", destinationType: "CASH" }),
      expect.any(Object),
    );
  });

  it("does not offer a zero-balance synthetic cash account as origin for a sale", () => {
    jest.mocked(transactions.usePositionsQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 10, currency: { code: "CUP" }, balance: 15000 },
    ] } as any);

    const { getByLabelText, getByText, queryByLabelText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByLabelText("Venta"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(queryByLabelText("Caja · USD")).toBeNull();
    expect(getByText("No hay fondos suficientes en Caja o cuentas bancarias para esta operación.")).toBeTruthy();
    expect(getByText("Guardar")).toBeDisabled();
  });

  it("summarizes a purchase with base currency leaving and FX entering", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);

    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(getByText("Resumen: salen 2400.00 de Caja · CUP y entran 10 en Caja · USD")).toBeTruthy();
  });

  it("uses only the latest rate per currency", () => {
    jest.mocked(transactions.useExchangeRatesQuery).mockReturnValue({ data: [
      { id: 1, currencyId: 1, buyRate: 200, sellRate: 210, effectiveDate: "2026-07-14T12:00:00.000Z" },
      { id: 2, currencyId: 1, buyRate: 240, sellRate: 260, effectiveDate: "2026-07-15T12:00:00.000Z" },
      { id: 3, currencyId: 2, buyRate: 280, sellRate: 320, effectiveDate: "2026-07-15T12:00:00.000Z" },
    ] } as any);
    const { getAllByLabelText, getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);

    fireEvent.press(getByLabelText("Moneda, USD"));
    expect(getAllByLabelText("USD")).toHaveLength(1);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ currencyId: 1, rate: 240 }), expect.any(Object));
  });

  it("submits accounts that belong to the newly selected currency", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByLabelText("Moneda, USD"));
    fireEvent.press(getByLabelText("EUR"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ currencyId: 2, destinationType: "CASH" }),
      expect.any(Object),
    );
    expect(getByText(/entran 10 en Caja · EUR/)).toBeTruthy();
  });
});
