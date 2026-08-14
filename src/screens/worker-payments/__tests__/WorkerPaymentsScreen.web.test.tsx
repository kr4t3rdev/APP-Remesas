import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { WorkerPaymentsScreen } from "../WorkerPaymentsScreen.web";
const mockRefetch = jest.fn();
jest.mock("../../../store/themeStore", () => ({ useColors: () => ({ background: "#fff", card: "#fff", border: "#ddd", primary: { 500: "#05c", 600: "#04a" }, text: { primary: "#111", secondary: "#555", tertiary: "#888" }, danger: "#c00" }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("../../../modules/worker-payments/application/useWorkerPayments", () => ({ useWorkersQuery: () => ({ data: [{ id: 1, name: "Ada", phone: "555", initials: "AD", balances: [{ id: 2, workerId: 1, currencyId: 2, currency: { code: "USD" }, balance: 100, accumulatedProfit: 12 }], transactions: [] }], isLoading: false, isError: false, refetch: mockRefetch }), useWorkerDetailQuery: () => ({ data: undefined, isLoading: false }) }));
describe("WorkerPaymentsScreen.web", () => { it("renders worker balance and filters list", () => { const { getByText, getByLabelText } = render(<WorkerPaymentsScreen />); expect(getByText("Pagos a trabajadores")).toBeTruthy(); expect(getByText("Ada")).toBeTruthy(); fireEvent.changeText(getByLabelText("Buscar trabajadores"), "zzz"); expect(getByText("No hay trabajadores con este filtro.")).toBeTruthy(); }); });
