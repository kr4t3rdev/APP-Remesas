import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CashHistoryScreen } from "./CashHistoryScreen.web";
jest.mock("../../store/themeStore", () => ({ useColors: () => ({ background: "#fff", card: "#fff", border: "#ddd", primary: { 500: "#06c" }, text: { primary: "#111", secondary: "#555", tertiary: "#777" }, danger: "#b00", success: "#070" }) }));
const mockRefetchAudits = jest.fn(); const mockRefetchAdjustments = jest.fn();
jest.mock("../../modules/cash/application/useCash", () => ({ useCashAuditsQuery: () => ({ data: [], isLoading: false, isError: false, refetch: mockRefetchAudits }), useCashAdjustmentsQuery: () => ({ data: [], isLoading: false, isError: false, refetch: mockRefetchAdjustments }) }));
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
describe("CashHistoryScreen.web", () => { it("renders empty state and refreshes both sources", () => { const screen = render(<CashHistoryScreen />); expect(screen.getByText("Historial de caja")).toBeTruthy(); expect(screen.getByText("No hay movimientos registrados.")).toBeTruthy(); fireEvent.press(screen.getByTestId("web-cash-history-refresh")); expect(mockRefetchAudits).toHaveBeenCalled(); expect(mockRefetchAdjustments).toHaveBeenCalled(); }); });
