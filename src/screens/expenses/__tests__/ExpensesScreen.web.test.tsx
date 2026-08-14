import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ExpensesScreen } from "../ExpensesScreen.web";
import { useExpensesQuery } from "../../../modules/expenses/application/useExpenses";

jest.mock("../../../modules/expenses/application/useExpenses", () => ({ useExpensesQuery: jest.fn() }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })) }));

const mockQuery = useExpensesQuery as jest.Mock;
describe("ExpensesScreen web surface", () => {
  beforeEach(() => { jest.clearAllMocks(); mockQuery.mockReturnValue({ data: [{ id: 1, description: "Renta local", amount: 250, currency: { code: "USD", symbol: "$" }, category: "renta", date: "2026-08-12", sourceType: "CASH" }], isLoading: false, isError: false, refetch: jest.fn().mockResolvedValue(undefined) }); });
  it("renders the expense ledger with category controls", () => { const { getByText, getByPlaceholderText } = render(<NavigationContainer><ExpensesScreen /></NavigationContainer>); expect(getByText("Gastos operativos")).toBeTruthy(); expect(getByText("Renta local")).toBeTruthy(); expect(getByPlaceholderText("Buscar por descripción o moneda")).toBeTruthy(); });
  it("changes category filters", () => { const { getByTestId } = render(<NavigationContainer><ExpensesScreen /></NavigationContainer>); fireEvent.press(getByTestId("web-expense-filter-servicios")); expect(mockQuery).toHaveBeenLastCalledWith({ category: "servicios" }); });
});
