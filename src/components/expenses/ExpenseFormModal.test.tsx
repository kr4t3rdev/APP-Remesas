import React from "react";
import { StyleSheet } from "react-native";
import { render, within } from "@testing-library/react-native";
import { ExpenseFormModal } from "./ExpenseFormModal";
import * as currencies from "../../modules/currencies/application/useCurrencies";
import * as bankAccounts from "../../modules/bank-accounts/application/useBankAccounts";

jest.mock("../../modules/currencies/application/useCurrencies");
jest.mock("../../modules/bank-accounts/application/useBankAccounts");
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

describe("ExpenseFormModal layout", () => {
  beforeEach(() => {
    jest.mocked(currencies.useCurrenciesQuery).mockReturnValue({ data: [] } as any);
    jest.mocked(bankAccounts.useBankAccountsQuery).mockReturnValue({ data: [] } as any);
  });

  it("anchors the sheet to the viewport bottom independently from keyboard layout", () => {
    const { getByTestId } = render(
      <ExpenseFormModal visible onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    const overlayStyle = StyleSheet.flatten(getByTestId("expense-modal-overlay").props.style);
    expect(overlayStyle).toEqual(expect.objectContaining({ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }));
    expect(overlayStyle).not.toHaveProperty("backgroundColor");
    const bottomAnchor = getByTestId("expense-modal-bottom-anchor");
    expect(StyleSheet.flatten(bottomAnchor.props.style)).toEqual(
      expect.objectContaining({
        position: "absolute",
        right: 0,
        bottom: 0,
        left: 0,
      }),
    );
    expect(within(bottomAnchor).getByTestId("expense-modal-keyboard-region")).toBeTruthy();
  });
});
