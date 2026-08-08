import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { AddBalanceModal } from "../AddBalanceModal";
import * as banks from "../../../modules/bank-accounts/application/useBankAccounts";
import * as cash from "../../../modules/cash/application/useCash";
import * as currencies from "../../../modules/currencies/application/useCurrencies";

jest.mock("../../../modules/bank-accounts/application/useBankAccounts");
jest.mock("../../../modules/cash/application/useCash");
jest.mock("../../../modules/currencies/application/useCurrencies");
jest.mock("../../animations", () => ({ FadeInDown: ({ children }: { children: React.ReactNode }) => children }));

describe("worker payment modal submissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(banks.useBankAccountsQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({
      data: [{ currencyId: 1, balance: 100, currency: { id: 1, code: "EUR", symbol: "€", name: "Euro", isActive: true } }],
    } as any);
    jest.mocked(currencies.useCurrenciesQuery).mockReturnValue({
      data: [{ id: 1, code: "EUR", symbol: "€", name: "Euro", isActive: true }],
    } as any);
  });

  it("submits a normalized comma decimal from AddBalanceModal", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <AddBalanceModal visible worker={null} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId("balance-amount-input"), "12,34");
    await act(async () => fireEvent.press(getByTestId("balance-submit-button")));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: 12.34, currencyId: 1 }));
  });

  it("does not submit an invalid AddBalanceModal amount as NaN", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <AddBalanceModal visible worker={null} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId("balance-amount-input"), "invalid");
    await act(async () => fireEvent.press(getByTestId("balance-submit-button")));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("offers empty cash and bank accounts as destinations in deposit mode", () => {
    jest.mocked(cash.useCashBalancesQuery).mockReturnValue({
      data: [{ currencyId: 1, balance: 0, currency: { id: 1, code: "EUR", symbol: "€", name: "Euro", isActive: true } }],
    } as any);
    jest.mocked(banks.useBankAccountsQuery).mockReturnValue({
      data: [{ id: 9, bankName: "Banco", name: "Cuenta Vacía", currencyId: 1, currency: { id: 1, code: "EUR", symbol: "€", name: "Euro", isActive: true }, balance: 0, isActive: true }],
    } as any);

    const { getByText } = render(
      <AddBalanceModal visible worker={null} onClose={jest.fn()} onSubmit={jest.fn()} mode="deposit" />,
    );

    expect(getByText("Caja · EUR")).toBeTruthy();
    expect(getByText("Banco · Cuenta Vacía")).toBeTruthy();
  });

  it("blocks depositing more than the worker balance in deposit mode", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByTestId, getByText } = render(
      <AddBalanceModal
        visible
        worker={{ id: 1, name: "Ana", initials: "AN", balances: [{ id: 7, workerId: 1, currencyId: 1, balance: 50, accumulatedProfit: 0, totalDelivered: 0 }] } as any}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        mode="deposit"
      />,
    );

    fireEvent.changeText(getByTestId("balance-amount-input"), "100");
    await act(async () => fireEvent.press(getByTestId("balance-submit-button")));

    expect(getByText(/supera el saldo disponible del trabajador/)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
