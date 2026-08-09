import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { TransactionModal } from "../TransactionModal";
import * as transactions from "../../../../modules/transactions/application/useTransactions";
import * as banks from "../../../../modules/bank-accounts/application/useBankAccounts";
import * as cash from "../../../../modules/cash/application/useCash";
import * as currencyQueries from "../../../../modules/currencies/application/useCurrencies";
jest.mock("../../../../modules/bank-accounts/application/useBankAccounts");
jest.mock("../../../../modules/cash/application/useCash");
jest.mock("../../../../modules/currencies/application/useCurrencies");

jest.mock("../../../../modules/transactions/application/useTransactions");

jest.mock("../../../animations", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { FadeInOverlay: () => React.createElement(View) };
});

describe("TransactionModal FX intent", () => {
  const mutate = jest.fn();
  const workerWithBalance = {
    id: 42,
    name: "Ana",
    balances: [{ id: 7, workerId: 42, currencyId: 1, currency: { id: 1, code: "USD", name: "US Dollar", symbol: "$", isActive: true }, balance: 100, accumulatedProfit: 0, totalDelivered: 0 }],
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(transactions.useCreateTransactionMutation).mockReturnValue({ mutate, isPending: false } as any);
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue({
      data: {
        currencies: [
          { id: 10, code: "CUP", name: "Peso cubano", symbol: "$", isActive: true },
          { id: 1, code: "USD", name: "US Dollar", symbol: "US$", isActive: true },
          { id: 2, code: "EUR", name: "Euro", symbol: "€", isActive: true },
        ],
        primaryCurrencyId: 10,
      },
    } as any);
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
      expect.objectContaining({ maxHeight: 180 }),
    ]));
    expect(getByLabelText("FX12")).toBeTruthy();
  });

  it("selects the chosen position and buy rate for COMPRA", () => {
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 10, currency: { code: "CUP" }, balance: 10000 },
      { currencyId: 1, currency: { code: "USD" }, balance: 100 },
      { currencyId: 2, currency: { code: "EUR" }, balance: 0 },
    ] } as any);
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
    expect(getByText(/Estado actual: saldo 100\.00/)).toBeTruthy();
    expect(getByText(/Proyección: total 2400\.00 · saldo 110\.00/)).toBeTruthy();
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

  it("blocks transfers when the configured primary currency metadata is missing", () => {
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue({
      data: { currencies: [{ id: 2, code: "USD", name: "US Dollar", symbol: "US$", isActive: true }], primaryCurrencyId: null },
    } as any);
    jest.mocked(transactions.useCurrenciesQuery).mockReturnValue({ data: [{ id: 2, code: "USD" }] } as any);
    const { getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    expect(getByText(/no se encontró la moneda principal configurada/i)).toBeTruthy();
    expect(getByText("Guardar")).toBeDisabled();
  });

  it("uses the configured primary currency instead of assuming CUP", () => {
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue({
      data: {
        currencies: [
          { id: 20, code: "EUR", name: "Euro", symbol: "€", isActive: true },
          { id: 1, code: "USD", name: "US Dollar", symbol: "US$", isActive: true },
        ],
        primaryCurrencyId: 20,
      },
    } as any);
    jest.mocked(transactions.useCurrenciesQuery).mockReturnValue({ data: [
      { id: 20, code: "EUR", name: "Euro", symbol: "€", isActive: true },
      { id: 1, code: "USD", name: "US Dollar", symbol: "US$", isActive: true },
    ] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 20, currency: { code: "EUR", symbol: "€" }, balance: 10000 },
      { currencyId: 1, currency: { code: "USD", symbol: "US$" }, balance: 100 },
    ] } as any);

    const { getByLabelText, getByText, queryByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(getByLabelText("Caja · EUR")).toBeTruthy();
    expect(getByText("Resumen: salen 2400.00 de Caja · EUR y entran 10 en Caja · USD")).toBeTruthy();
    expect(queryByText(/moneda base CUP/i)).toBeNull();
  });

  it("shows the real backend message when saving the operation fails", () => {
    const { getByLabelText, getByText, queryByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    const options = mutate.mock.calls[0][1];
    act(() => options.onError({ response: { data: { message: "Saldo insuficiente en caja" } } }));

    expect(getByText("Saldo insuficiente en caja")).toBeTruthy();
    expect(queryByText("No se pudo guardar la operación. Intentá nuevamente.")).toBeNull();
  });

  it("falls back to the generic message when the backend error has no message", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    const options = mutate.mock.calls[0][1];
    act(() => options.onError({}));

    expect(getByText("No se pudo guardar la operación. Intentá nuevamente.")).toBeTruthy();
  });

  it("allows buying a rated currency without a previous position or cash balance", () => {
    jest.mocked(transactions.usePositionsQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 10, currency: { code: "CUP" }, balance: 15000 },
      { currencyId: 1, currency: { code: "USD" }, balance: 0 },
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
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 10, currency: { code: "CUP" }, balance: 10000 },
      { currencyId: 1, currency: { code: "USD" }, balance: 100 },
      { currencyId: 2, currency: { code: "EUR" }, balance: 0 },
    ] } as any);
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

  it("switches between accessible Transferencia and Remesas tabs", () => {
    const { getByLabelText } = render(<TransactionModal visible onClose={jest.fn()} />);

    expect(getByLabelText("Transferencia").props.accessibilityState).toEqual({ selected: true });
    fireEvent.press(getByLabelText("Remesas"));
    expect(getByLabelText("Remesas").props.accessibilityState).toEqual({ selected: true });
  });

  it("initializes and synchronizes the editable rate from the active operation side", () => {
    const { getByLabelText } = render(<TransactionModal visible onClose={jest.fn()} />);

    expect(getByLabelText("Tasa de cambio").props.value).toBe("240");
    fireEvent.press(getByLabelText("Venta"));
    expect(getByLabelText("Tasa de cambio").props.value).toBe("260");
    fireEvent.press(getByLabelText("Moneda, USD"));
    fireEvent.press(getByLabelText("EUR"));
    expect(getByLabelText("Tasa de cambio").props.value).toBe("320");
  });

  it("normalizes floating-point active rates before validating them", () => {
    jest.mocked(transactions.useExchangeRatesQuery).mockReturnValue({ data: [
      { currencyId: 1, buyRate: 240, sellRate: 533.0210000000001 },
      { currencyId: 2, buyRate: 280, sellRate: 320 },
    ] } as any);
    const { getByLabelText, getByText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );

    fireEvent.press(getByText("Venta"));
    expect(getByLabelText("Tasa de cambio").props.value).toBe("533.021");
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(getByLabelText("Guardar")).not.toBeDisabled();
  });

  it("submits a remittance with a momentary custom rate", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByLabelText("Remesas"));
    fireEvent.changeText(getByLabelText("Tasa de cambio"), "245.5");
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      operationKind: "REMITTANCE",
      persistRate: false,
      rate: 245.5,
    }), expect.any(Object));
    expect(getByText(/245\.5/)).toBeTruthy();
  });

  it("allows persisting the entered rate and reports an effective rounded rate", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Tasa de cambio"), "260");
    fireEvent.press(getByLabelText("Guardar como tasa actual"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ persistRate: true, rate: 260 }), expect.any(Object));
    act(() => mutate.mock.calls[0][1].onSuccess({ transaction: { requestedRate: 260, rate: 260.01, persistRate: true } }));
    expect(getByText(/Tasa actual guardada: 260\.01/)).toBeTruthy();
  });

  it("normalizes comma decimals and rejects non-finite rates explicitly", () => {
    const { getByLabelText, getByText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.changeText(getByLabelText("Tasa de cambio"), "245,5");
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenLastCalledWith(expect.objectContaining({ rate: 245.5 }), expect.any(Object));

    fireEvent.changeText(getByLabelText("Tasa de cambio"), "Infinity");
    expect(getByText("Ingresá una tasa válida entre 0.0001 y 999999.9999, con hasta 4 decimales.")).toBeTruthy();
    expect(getByText("Guardar")).toBeDisabled();
  });

  it("resets remittance persistence after success and when the modal reopens", () => {
    const onClose = jest.fn();
    const { getByLabelText, getByText, rerender } = render(<TransactionModal visible onClose={onClose} />);
    fireEvent.press(getByLabelText("Remesas"));
    fireEvent.press(getByLabelText("Guardar como tasa actual"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    act(() => mutate.mock.calls[0][1].onSuccess({ transaction: { rate: 240.01 } }));

    expect(getByLabelText("Transferencia").props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText("Guardar como tasa actual").props.accessibilityState).toEqual({ checked: false });
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenNthCalledWith(2, expect.objectContaining({ operationKind: "TRANSFER", persistRate: false }), expect.any(Object));

    fireEvent.press(getByLabelText("Remesas"));
    fireEvent.press(getByLabelText("Guardar como tasa actual"));
    rerender(<TransactionModal visible={false} onClose={onClose} />);
    rerender(<TransactionModal visible onClose={onClose} />);
    expect(getByLabelText("Transferencia").props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText("Guardar como tasa actual").props.accessibilityState).toEqual({ checked: false });
  });

  it("sends worker profit as FX context in the same request", () => {
    const { getByLabelText, getByText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );

    expect(getByText(/opcional/)).toBeTruthy();
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.changeText(getByLabelText("Ganancia del trabajador"), "3.5");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      workerId: 42,
      workerProfit: 3.5,
      workerCurrencyId: 1,
    }), expect.any(Object));
  });

  it("shows only cash legs for worker FX operations", () => {
    jest.mocked(banks.useBankAccountsQuery).mockReturnValue({ data: [
      { id: 9, bankName: "Banco", name: "Cuenta USD", currencyId: 1, balance: 1000, isActive: true },
    ] } as any);
    const { getByLabelText, getByText, queryByLabelText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );
    expect(queryByLabelText("Banco · Cuenta USD")).toBeNull();
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "CASH", destinationType: "CASH", sourceBankAccountId: undefined, destinationBankAccountId: undefined }), expect.any(Object));
  });

  it("uses the selected worker balance instead of the real cash account", () => {
    const { getByLabelText, getByText, queryByLabelText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );

    expect(getByLabelText("Saldo trabajador · USD")).toBeTruthy();
    expect(queryByLabelText("Caja · CUP")).toBeNull();
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      workerId: 42,
      workerCurrencyId: 1,
      sourceType: "CASH",
    }), expect.any(Object));
  });

  it("keeps the worker account as source when the traded currency differs", () => {
    const { getByLabelText, getByText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );

    fireEvent.press(getByLabelText("Moneda, USD"));
    fireEvent.press(getByLabelText("EUR"));
    fireEvent.press(getByText("Venta"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(getByLabelText("Saldo trabajador · USD")).toBeTruthy();
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      type: "VENTA",
      currencyId: 2,
      workerCurrencyId: 1,
      sourceType: "CASH",
    }), expect.any(Object));
  });

  it("uses the worker balance as the source for a worker sale", () => {
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 10, currency: { code: "CUP" }, balance: 10000 },
      { currencyId: 1, currency: { code: "USD" }, balance: 0 },
    ] } as any);
    const { getByLabelText, getByText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );

    fireEvent.press(getByText("Venta"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    fireEvent.press(getByText("Guardar"));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      type: "VENTA",
      workerId: 42,
      workerCurrencyId: 1,
      sourceType: "CASH",
      destinationType: "CASH",
    }), expect.any(Object));
  });

  it("allows a worker sale to create the missing primary cash destination", () => {
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({ data: [
      { currencyId: 1, currency: { code: "USD" }, balance: 0 },
    ] } as any);
    const { getByLabelText, getByText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={workerWithBalance} />,
    );

    fireEvent.press(getByText("Venta"));
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");

    expect(getByLabelText("Caja · CUP")).toBeTruthy();
    fireEvent.press(getByText("Guardar"));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      type: "VENTA",
      workerId: 42,
      destinationType: "CASH",
      destinationBankAccountId: undefined,
    }), expect.any(Object));
  });

  it("does not offer cash accounts that do not exist in the backend", () => {
    const { getByLabelText, queryByLabelText } = render(<TransactionModal visible onClose={jest.fn()} />);
    fireEvent.press(getByLabelText("Moneda, USD"));
    fireEvent.press(getByLabelText("EUR"));
    expect(queryByLabelText("Caja · EUR")).toBeNull();
  });

  it("blocks worker FX without an explicit worker currency balance", () => {
    const { getByLabelText, getAllByText } = render(
      <TransactionModal visible onClose={jest.fn()} worker={{ id: 42, name: "Ana", balances: [] }} />,
    );
    fireEvent.changeText(getByLabelText("Monto de la operación"), "10");
    expect(getAllByText(/no tiene un saldo monetario seleccionado/i).length).toBeGreaterThan(0);
    expect(getByLabelText("Guardar").props.accessibilityState?.disabled ?? getByLabelText("Guardar").props.disabled).toBe(true);
    expect(mutate).not.toHaveBeenCalled();
  });
});
