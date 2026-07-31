import React from "react";
import { StyleSheet } from "react-native";
import { fireEvent, render, waitFor, within } from "@testing-library/react-native";
import { ExpenseFormModal } from "./ExpenseFormModal";
import * as currencies from "../../modules/currencies/application/useCurrencies";
import * as bankAccounts from "../../modules/bank-accounts/application/useBankAccounts";
import { Alert } from "../../utils/alert";

jest.mock("../../modules/currencies/application/useCurrencies");
jest.mock("../../modules/bank-accounts/application/useBankAccounts");
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

describe("ExpenseFormModal layout", () => {
  beforeEach(() => {
    jest.mocked(currencies.useCurrenciesQuery).mockReturnValue({ data: [{ id: 1, code: "CUP", name: "Peso cubano", symbol: "$" }] } as any);
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

  it("propagates onSubmit rejection without showing an Alert", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const onSubmit = jest.fn().mockRejectedValueOnce({
      response: { data: { message: "Saldo insuficiente en caja" } },
    });

    const { getByTestId, getByText } = render(
      <ExpenseFormModal visible onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId("expense-description-input"), "Internet");
    fireEvent.changeText(getByTestId("expense-amount-input"), "100");
    fireEvent.press(getByText("CUP"));
    fireEvent.press(getByTestId("expense-submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(alertSpy).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
