import React from "react";
import { render } from "@testing-library/react-native";
import { TransactionCard } from "../TransactionCard";
import { Transaction } from "../../../../types/business";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("TransactionCard", () => {
  it("renders BUY transaction correctly", () => {
    const mockTx: Transaction = {
      id: "1",
      date: "2023-10-24T09:42:00Z",
      type: "BUY",
      sourceCurrency: "USD",
      targetCurrency: "CUP",
      amount: 5000,
      rate: 250,
      status: "RECONCILED",
    };

    const { getByText } = render(<TransactionCard transaction={mockTx} />);

    expect(getByText("Currency Exchange")).toBeTruthy();
    expect(getByText("BUY")).toBeTruthy();
    expect(getByText("5,000.00 USD")).toBeTruthy();
    expect(getByText("250.00 CUP")).toBeTruthy();
    expect(getByText("1,250,000 CUP")).toBeTruthy();
    expect(getByText("RECONCILED")).toBeTruthy();
  });

  it("renders SELL transaction correctly", () => {
    const mockTx: Transaction = {
      id: "2",
      date: "2023-10-24T11:15:00Z",
      type: "SELL",
      sourceCurrency: "USD",
      targetCurrency: "CUP",
      amount: 1200,
      rate: 248.5,
      status: "PENDING",
    };

    const { getByText } = render(<TransactionCard transaction={mockTx} />);

    expect(getByText("Market Liquidation")).toBeTruthy();
    expect(getByText("SELL")).toBeTruthy();
    expect(getByText("1,200.00 USD")).toBeTruthy();
    expect(getByText("248.50 CUP")).toBeTruthy();
    expect(getByText("298,200 CUP")).toBeTruthy();
    expect(getByText("PENDING")).toBeTruthy();
  });
});
