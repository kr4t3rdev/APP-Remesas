import React from "react";
import { render } from "@testing-library/react-native";
import { CashFlowCurrencyCards } from "./CashFlowCurrencyCards";

describe("CashFlowCurrencyCards", () => {
  it("renders separate currency balances and never a mixed total", () => {
    const { getByText, queryByTestId } = render(
      <CashFlowCurrencyCards
        colors={{
          surface: "#fff",
          text: { primary: "#111", secondary: "#555" },
          success: "#0a0",
          danger: "#a00",
        } as any}
        currencies={[
          {
            currency: { code: "CUP", symbol: "$" },
            inflows: { transactions: 2700, adjustments: 0, total: 2700 },
            outflows: { transactions: 1200, expenses: 0, adjustments: 0, total: 1200 },
            balance: 1500,
          },
          {
            currency: { code: "EUR", symbol: "€" },
            inflows: { transactions: 0, adjustments: 3, total: 3 },
            outflows: { transactions: 0, expenses: 5, adjustments: 0, total: 5 },
            balance: -2,
          },
        ]}
      />,
    );

    expect(getByText("CUP")).toBeTruthy();
    expect(getByText("EUR")).toBeTruthy();
    expect(getByText("+$ 1,500.00")).toBeTruthy();
    expect(getByText("-€ 2.00")).toBeTruthy();
    expect(queryByTestId("mixed-currency-total")).toBeNull();
  });
});
