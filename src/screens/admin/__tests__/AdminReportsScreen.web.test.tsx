import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminReportsScreen } from "../AdminReportsScreen.web";
import { useAdminReportsDashboard } from "../../../modules/admin/application/useAdminReportsDashboard";

jest.mock("../../../modules/admin/application/useAdminReportsDashboard", () => ({ useAdminReportsDashboard: jest.fn() }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })) }));

const mockUseAdminReportsDashboard = useAdminReportsDashboard as jest.Mock;
const dashboardValue = (setPeriod = jest.fn()) => ({
  period: "monthly", setPeriod, metricTiles: [{ id: "mrr", title: "MRR (CUP)", valueLabel: "$12,500", trend: { direction: "up", valueLabel: "8.2%" }, icon: "cash-outline" }, { id: "users", title: "Usuarios", valueLabel: "24", trend: { direction: "neutral", valueLabel: "0.0%" }, icon: "people-outline" }],
  platform: { totalLabel: "$12,500", deltaLabel: "+8.2%", bars: [{ label: "ENE", value: 100 }, { label: "FEB", value: 160, isActive: true }], isEmpty: false },
  usersGrowth: { points: [{ label: "ENE", value: 3 }, { label: "FEB", value: 5 }], peakLabel: "Pico: 5" },
  systemUsageRows: [{ id: "api", title: "Rendimiento API", subtitle: "No disponible", icon: "speedometer-outline", status: "unavailable" }],
  isLoading: false, isRefreshing: false, hasPartialError: false, refetchAll: jest.fn().mockResolvedValue(undefined),
});

describe("AdminReportsScreen web surface", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminReportsDashboard.mockReturnValue(dashboardValue());
  });

  it("renders report controls, metrics and platform trend", () => {
    const { getByText, getByTestId } = render(<NavigationContainer><AdminReportsScreen /></NavigationContainer>);
    expect(getByText("Reportes de plataforma")).toBeTruthy();
    expect(getByText("MRR (CUP)")).toBeTruthy();
    expect(getByText("Actividad de plataforma")).toBeTruthy();
    expect(getByTestId("admin-web-period-monthly")).toBeTruthy();
  });

  it("changes the selected period", () => {
    const setPeriod = jest.fn();
    mockUseAdminReportsDashboard.mockReturnValue(dashboardValue(setPeriod));
    const { getByTestId } = render(<NavigationContainer><AdminReportsScreen /></NavigationContainer>);
    fireEvent.press(getByTestId("admin-web-period-weekly"));
    expect(setPeriod).toHaveBeenCalledWith("weekly");
  });
});
