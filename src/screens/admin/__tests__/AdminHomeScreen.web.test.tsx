import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminHomeScreen } from "../AdminHomeScreen.web";
import { useAdminHomeData } from "../../../modules/admin/application/useAdminHomeData";

jest.mock("../../../modules/admin/application/useAdminHomeData", () => ({
  useAdminHomeData: jest.fn(),
}));

jest.mock("../../../store/themeStore", () => ({
  useColors: jest.fn(() => ({
    background: "#f6f8fb",
    card: "#ffffff",
    border: "#dbe3ed",
    text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#ffffff" },
    primary: { 400: "#4d84f7", 500: "#2563eb", 600: "#1d4ed8" },
    success: "#15803d",
    warning: "#b45309",
    danger: "#b91c1c",
  })),
}));

jest.mock("../../../store/authStore", () => ({
  useAuthStore: jest.fn(() => ({ user: { name: "Admin User", email: "admin@test.com" } })),
}));

const mockUseAdminHomeData = useAdminHomeData as jest.Mock;

const viewModel = () => ({
  kpis: { totalUsers: 24, activeUsers30d: 18, newUsersPeriod: 5, suspendedUsers: 2, revenueAtRiskCup: 900, trialToPaidConversionPct: 42.5 },
  blockedUsersCount: 2,
  expiring7dCount: 3,
  licenseStateEntries: [],
  recentEvents: [{ id: 1, action: "LOGIN_SUCCESS", createdAt: new Date().toISOString() }],
  isLoadingInitial: false,
  isRefreshing: false,
  hasPartialFailure: false,
  blockErrors: { kpis: false, licenseState: false, events: false },
  refetchAll: jest.fn().mockResolvedValue(undefined),
});

describe("AdminHomeScreen web surface", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminHomeData.mockReturnValue(viewModel());
  });

  it("exposes an operations dashboard with KPI cards and activity feed", () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer><AdminHomeScreen /></NavigationContainer>,
    );

    expect(getByText("Control de plataforma")).toBeTruthy();
    expect(getByText("Usuarios totales")).toBeTruthy();
    expect(getByText("Actividad reciente")).toBeTruthy();
    expect(getByTestId("admin-web-refresh")).toBeTruthy();
  });

  it("keeps refresh as an explicit 44px touch target", () => {
    const refetchAll = jest.fn().mockResolvedValue(undefined);
    mockUseAdminHomeData.mockReturnValue({ ...viewModel(), refetchAll });
    const { getByTestId } = render(<NavigationContainer><AdminHomeScreen /></NavigationContainer>);

    fireEvent.press(getByTestId("admin-web-refresh"));
    expect(refetchAll).toHaveBeenCalledTimes(1);
  });
});
