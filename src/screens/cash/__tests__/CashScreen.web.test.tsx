import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { CashScreen } from "../CashScreen.web";
import { useCashOverviewQuery } from "../../../modules/cash/application/useCash";

jest.mock("../../../modules/cash/application/useCash", () => ({ useCashOverviewQuery: jest.fn() }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })) }));

const mockQuery = useCashOverviewQuery as jest.Mock;
describe("CashScreen web surface", () => {
  beforeEach(() => { jest.clearAllMocks(); mockQuery.mockReturnValue({ data: { primaryCurrency: { id: 1, code: "CUP", symbol: "$" }, balances: [{ id: 1, balance: 12500, currencyId: 1, currency: { code: "CUP", symbol: "$" } }], recentMovements: [{ id: "m1", kind: "TRANSACTION", type: "VENTA", direction: "IN", title: "Venta de USD", description: "Caja principal", amount: 100, totalBase: 40000, currency: { code: "USD", symbol: "$" }, createdAt: new Date().toISOString() }], latestAudits: [], currencies: [], asOf: new Date().toISOString() }, isLoading: false, isError: false, refetch: jest.fn().mockResolvedValue(undefined) }); });
  it("renders balance ledger and recent cash movements", () => { const { getByText } = render(<NavigationContainer><CashScreen /></NavigationContainer>); expect(getByText("Caja operativa")).toBeTruthy(); expect(getByText("Saldo por moneda")).toBeTruthy(); expect(getByText("Venta de USD")).toBeTruthy(); });
});
