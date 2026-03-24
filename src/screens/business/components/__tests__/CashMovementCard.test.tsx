import React from "react";
import { render } from "@testing-library/react-native";
import { CashMovementCard } from "../CashMovementCard";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("CashMovementCard", () => {
  it("renders income movement correctly", () => {
    const mockIncome = {
      id: "1",
      title: "Sales",
      subtitle: "Today",
      amount: 1000,
      type: "INCOME" as const,
      badgeLabel: "Income",
    };

    const { getByText } = render(<CashMovementCard movement={mockIncome} />);

    expect(getByText("Sales")).toBeTruthy();
    expect(getByText("Today")).toBeTruthy();
    expect(getByText("+$1,000.00")).toBeTruthy();
    expect(getByText("Income")).toBeTruthy();
  });

  it("renders expense movement correctly", () => {
    const mockExpense = {
      id: "2",
      title: "Supplies",
      subtitle: "Yesterday",
      amount: 50,
      type: "EXPENSE" as const,
      badgeLabel: "Expense",
    };

    const { getByText } = render(<CashMovementCard movement={mockExpense} />);

    expect(getByText("Supplies")).toBeTruthy();
    expect(getByText("-$50.00")).toBeTruthy();
    expect(getByText("Expense")).toBeTruthy();
  });
});
