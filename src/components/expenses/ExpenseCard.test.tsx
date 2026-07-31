import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ExpenseCard } from "./ExpenseCard";

describe("ExpenseCard", () => {
  it("delegates delete to the parent without showing a second confirmation", () => {
    const onDelete = jest.fn();
    const expense = {
      id: 1,
      description: "Internet",
      amount: 50,
      currencyId: 1,
      currency: {
        id: 1,
        code: "USD",
        name: "Dolar estadounidense",
        symbol: "$",
        isActive: true,
      },
      category: "servicios" as const,
      date: "2026-03-06",
      sourceType: "CASH" as const,
    };

    const { getByTestId } = render(
      <ExpenseCard expense={expense} onDelete={onDelete} />,
    );

    fireEvent.press(getByTestId("expense-delete-button"));

    expect(onDelete).toHaveBeenCalledWith(expense);
  });
});
