import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { OpenPositionModal } from "../OpenPositionModal";
import * as cashQueries from "../../../../modules/cash/application/useCash";
import * as transactionQueries from "../../../../modules/transactions/application/useTransactions";
import * as currencyQueries from "../../../../modules/currencies/application/useCurrencies";

jest.mock("../../../../modules/cash/application/useCash");
jest.mock("../../../../modules/transactions/application/useTransactions");
jest.mock("../../../../modules/currencies/application/useCurrencies");

describe("OpenPositionModal", () => {
  const mutateAsync = jest.fn().mockResolvedValue({});
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(cashQueries.useCashBalancesQuery).mockReturnValue({
      data: [{ currencyId: 2, currency: { id: 2, code: "USD", name: "US Dollar", symbol: "$", isActive: true }, balance: 50 }],
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
    } as any);
    jest.mocked(transactionQueries.useOpenPositionMutation).mockReturnValue({ mutateAsync, isPending: false } as any);
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue({
      data: { currencies: [{ id: 10, code: "CUP", symbol: "$", isActive: true }, { id: 2, code: "USD", symbol: "US$", isActive: true }], primaryCurrencyId: 10 },
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
    } as any);
  });

  it("shows a loading placeholder until primary currency and real cash balances are ready", () => {
    jest.mocked(cashQueries.useCashBalancesQuery).mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: true,
      isPlaceholderData: true,
    } as any);
    jest.mocked(currencyQueries.useCurrenciesWithPrimaryQuery).mockReturnValue({
      data: { currencies: [], primaryCurrencyId: null },
      isLoading: true,
      isFetching: true,
      isPlaceholderData: true,
    } as any);

    const { getByText, queryByText, queryByLabelText } = render(
      <OpenPositionModal visible positions={[]} onClose={onClose} />,
    );

    expect(getByText("Cargando moneda principal y saldos...")) .toBeTruthy();
    expect(queryByText("No hay una moneda con saldo histórico pendiente de revisión.")).toBeNull();
    expect(queryByLabelText("Costo promedio inicial")).toBeNull();
  });

  it("submits the selected currency and historical cost", async () => {
    const { getByLabelText, getByRole } = render(<OpenPositionModal visible positions={[]} onClose={onClose} />);

    fireEvent.changeText(getByLabelText("Costo promedio inicial"), "250,1250");
    await act(async () => {
      fireEvent.press(getByRole("button", { name: "Abrir posición" }));
    });

    expect(mutateAsync).toHaveBeenCalledWith({ currencyId: 2, openingCost: 250.125 });
    expect(onClose).toHaveBeenCalled();
  });

  it("blocks an invalid historical cost", async () => {
    const { getByLabelText, getByRole, queryByText } = render(<OpenPositionModal visible positions={[]} onClose={onClose} />);

    fireEvent.changeText(getByLabelText("Costo promedio inicial"), "1.00001");
    await act(async () => {
      fireEvent.press(getByRole("button", { name: "Abrir posición" }));
    });

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(queryByText(/costo inicial entre/)).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("offers an existing UNREVIEWED position instead of hiding its currency", () => {
    const { getByLabelText } = render(
      <OpenPositionModal
        visible
        positions={[{
          currencyId: 2,
          currency: { id: 2, code: "USD", name: "US Dollar", symbol: "US$", isActive: true },
          saldo: 50,
          costoPromedio: null,
          availableForSale: false,
          reviewStatus: "UNREVIEWED",
        }]}
        onClose={onClose}
      />,
    );

    expect(getByLabelText("USD")).toBeTruthy();
  });
});
