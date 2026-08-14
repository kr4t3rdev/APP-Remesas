import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { TransactionsScreen } from "../TransactionsScreen.web";
import { useTransactionsQuery } from "../../../modules/transactions/application/useTransactions";

jest.mock("../../../modules/transactions/application/useTransactions", () => ({ useTransactionsQuery: jest.fn() }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c", financial: { compra: "#b91c1c", venta: "#15803d" } })) }));

const mockQuery = useTransactionsQuery as jest.Mock;
describe("TransactionsScreen web surface", () => {
  beforeEach(() => { jest.clearAllMocks(); mockQuery.mockReturnValue({ data: [{ id: 1, type: "VENTA", operationKind: "TRANSFER", amount: 100, rate: 400, totalCup: 40000, currency: { code: "USD", symbol: "$" }, createdAt: new Date().toISOString() }], isLoading: false, isError: false, refetch: jest.fn().mockResolvedValue(undefined) }); });
  it("renders an operational transaction ledger", () => { const { getByText, getByPlaceholderText } = render(<NavigationContainer><TransactionsScreen /></NavigationContainer>); expect(getByText("Libro de transacciones")).toBeTruthy(); expect(getByText("Venta de USD")).toBeTruthy(); expect(getByPlaceholderText("Buscar por moneda o tipo")).toBeTruthy(); });
  it("changes the transaction filter", () => { const { getByTestId } = render(<NavigationContainer><TransactionsScreen /></NavigationContainer>); fireEvent.press(getByTestId("web-filter-COMPRA")); expect(mockQuery).toHaveBeenLastCalledWith({ type: "COMPRA", operationKind: "TRANSFER" }); });
});
