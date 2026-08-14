import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { HomeScreen } from "../HomeScreen.web";
import { useDashboardData } from "../../../hooks/useDashboardData";

jest.mock("../../../hooks/useDashboardData", () => ({ useDashboardData: jest.fn() }));
jest.mock("../../../modules/worker-payments/application/useWorkerPayments", () => ({ useWorkersQuery: jest.fn(() => ({ data: [] })) }));
jest.mock("../../../store/authStore", () => ({ useAuthStore: jest.fn(() => ({ user: { name: "Ana Torres" } })) }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c", financial: { compra: "#b91c1c", venta: "#15803d" }, currencies: { usd: { primary: "#2563eb", bg: "#eff6ff" }, eur: { primary: "#7c3aed", bg: "#f5f3ff" }, mlc: { primary: "#db2777", bg: "#fdf2f8" }, cup: { primary: "#15803d", bg: "#f0fdf4" } } })) }));

const mockUseDashboardData = useDashboardData as jest.Mock;
describe("HomeScreen web surface", () => {
  beforeEach(() => { jest.clearAllMocks(); mockUseDashboardData.mockReturnValue({ isLoading: false, isRefreshing: false, refetchAll: jest.fn(), summary: { primaryCurrency: { code: "CUP", symbol: "$" }, totalBalance: 15200, transactionSummary: { comprasCount: 7, ventasCount: 4 } }, cashBalances: [], recentTransactions: [], activeObjectives: [] }); });
  it("renders an operator dashboard with balance and quick actions", () => { const { getByText } = render(<NavigationContainer><HomeScreen /></NavigationContainer>); expect(getByText(/Ana Torres/)).toBeTruthy(); expect(getByText("SALDO CONSOLIDADO")).toBeTruthy(); expect(getByText("Atajos rápidos")).toBeTruthy(); });
});
