import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminHomeScreen } from "../AdminHomeScreen";
import { useAdminHomeData } from "../../../modules/admin/application/useAdminHomeData";

jest.mock("../../../modules/admin/application/useAdminHomeData", () => ({
  useAdminHomeData: jest.fn(),
}));

jest.mock("../../../store/authStore", () => ({
  useAuthStore: jest.fn(() => ({
    name: "Admin User",
    email: "admin@test.com",
  })),
}));

const mockUseAdminHomeData = useAdminHomeData as jest.Mock;

const buildEvents = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    actorUserId: 1,
    action: `EVENT_${index + 1}`,
    reason: null,
    createdAt: new Date(Date.now() - index * 60_000).toISOString(),
  }));

const createBaseViewModel = () => ({
  kpis: {
    totalUsers: 10,
    activeUsers30d: 8,
    newUsersPeriod: 3,
    suspendedUsers: 1,
    usersByRole: { ADMIN: 1, USER: 9 },
    usersByPlan: {},
    licensesByState: { ACTIVE: 8, EXPIRED: 2 },
    expiringIn7d: 1,
    expiringIn30d: 2,
    churnPeriod: 0,
    reactivatedPeriod: 0,
    trialToPaidConversionPct: 0,
    renewalRatePct: 0,
    cancellationRatePct: 0,
    mrrEstimateCup: 0,
    arpuEstimateCup: 0,
    revenueAtRiskCup: 0,
  },
  blockedUsersCount: 1,
  expiring7dCount: 2,
  licenseStateEntries: [
    { state: "ACTIVE", count: 8 },
    { state: "EXPIRED", count: 2 },
  ],
  recentEvents: buildEvents(3),
  isLoadingInitial: false,
  isRefreshing: false,
  hasPartialFailure: false,
  blockErrors: { kpis: false, licenseState: false, events: false },
  refetchAll: jest.fn().mockResolvedValue(undefined),
});

const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("AdminHomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminHomeData.mockReturnValue(createBaseViewModel());
  });

  it('renders finance-style header with title "Inicio"', () => {
    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Inicio")).toBeTruthy();
  });

  it('renders hero card with "Total usuarios" metric', () => {
    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Total usuarios")).toBeTruthy();
    expect(getByText("10")).toBeTruthy();
  });

  it('renders hero card with "Reportes" button', () => {
    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Reportes")).toBeTruthy();
  });

  it('renders weekly progress card with title "Progreso semanal"', () => {
    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Progreso semanal")).toBeTruthy();
  });

  it('renders events section with title "Eventos recientes"', () => {
    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Eventos recientes")).toBeTruthy();
  });

  it('renders "Ver todo" link in events section', () => {
    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Ver todo")).toBeTruthy();
  });

  it("shows empty state when no events are available", () => {
    mockUseAdminHomeData.mockReturnValueOnce({
      ...createBaseViewModel(),
      recentEvents: [],
    });

    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Sin eventos recientes")).toBeTruthy();
  });

  it('shows "Sin datos esta semana" when weekly progress is empty', () => {
    mockUseAdminHomeData.mockReturnValueOnce({
      ...createBaseViewModel(),
      recentEvents: [],
    });

    const { getByText } = renderWithNavigation(<AdminHomeScreen />);

    expect(getByText("Sin datos esta semana")).toBeTruthy();
  });

  it("triggers refresh when header icon is pressed", () => {
    const refetchAll = jest.fn().mockResolvedValue(undefined);
    mockUseAdminHomeData.mockReturnValueOnce({
      ...createBaseViewModel(),
      refetchAll,
    });

    const { getByTestId } = renderWithNavigation(<AdminHomeScreen />);

    fireEvent.press(getByTestId("admin-home-refresh-button"));

    expect(refetchAll).toHaveBeenCalledTimes(1);
  });

  it("shows warning indicator when KPIs have partial failure", () => {
    mockUseAdminHomeData.mockReturnValueOnce({
      ...createBaseViewModel(),
      blockErrors: { kpis: true, licenseState: false, events: false },
      hasPartialFailure: true,
    });

    const { getByTestId, getByText } = renderWithNavigation(
      <AdminHomeScreen />,
    );

    expect(getByTestId("admin-home-kpis-warning")).toBeTruthy();
    expect(getByText("Datos parciales, intenta actualizar")).toBeTruthy();
  });

  it("shows warning indicator when events have partial failure", () => {
    mockUseAdminHomeData.mockReturnValueOnce({
      ...createBaseViewModel(),
      blockErrors: { kpis: false, licenseState: false, events: true },
      hasPartialFailure: true,
    });

    const { getByTestId, getByText } = renderWithNavigation(
      <AdminHomeScreen />,
    );

    expect(getByTestId("admin-home-events-warning")).toBeTruthy();
    expect(getByText("Datos parciales, intenta actualizar")).toBeTruthy();
  });

  it("caps recent events at 8 items", () => {
    mockUseAdminHomeData.mockReturnValueOnce({
      ...createBaseViewModel(),
      recentEvents: buildEvents(12),
    });

    const { getAllByTestId, queryByText } = renderWithNavigation(
      <AdminHomeScreen />,
    );

    expect(getAllByTestId("admin-home-event-row")).toHaveLength(8);
    expect(queryByText("EVENT_9")).toBeNull();
  });
});
