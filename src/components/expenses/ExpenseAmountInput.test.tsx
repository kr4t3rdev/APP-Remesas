import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ExpenseAmountInput } from "./ExpenseAmountInput";

describe("ExpenseAmountInput", () => {
  it.each([
    ["1.5", "1.5"],
    ["1,5", "1.5"],
    ["1.234", "1.23"],
    ["1.2.3", "1.23"],
    ["abc", ""],
  ])("normalizes %s to %s", (input, expected) => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <ExpenseAmountInput value="" onChange={onChange} />,
    );

    fireEvent.changeText(getByTestId("expense-amount-input"), input);

    expect(onChange).toHaveBeenLastCalledWith(expected);
  });
});
