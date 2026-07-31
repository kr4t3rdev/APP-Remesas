import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { AddBalanceModal } from "../AddBalanceModal";
import { TransactionFormModal } from "../TransactionFormModal";
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

  it("submits normalized comma decimals from TransactionFormModal", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TransactionFormModal visible worker={null} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId("transaction-amount-input"), "10,25");
    fireEvent.changeText(getByTestId("transaction-profit-input"), "2,50");
    await act(async () => fireEvent.press(getByTestId("transaction-submit-button")));

    expect(onSubmit).toHaveBeenCalledWith(10.25, 2.5, undefined);
  });

  it("does not submit invalid TransactionFormModal values as NaN", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TransactionFormModal visible worker={null} onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId("transaction-amount-input"), "NaN");
    fireEvent.changeText(getByTestId("transaction-profit-input"), "2,50");
    await act(async () => fireEvent.press(getByTestId("transaction-submit-button")));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
