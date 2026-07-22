import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminReportsScreen } from "../AdminReportsScreen";
import { useAdminReportsDashboard } from "../../../modules/admin/application/useAdminReportsDashboard";

jest.mock(
  "../../../modules/admin/application/useAdminReportsDashboard",
  () => ({
    useAdminReportsDashboard: jest.fn(),
  }),
);

const mockUseAdminReportsDashboard = useAdminReportsDashboard as jest.Mock;

const createDashboardVM = () => ({
  period: "monthly" as const,
  setPeriod: jest.fn(),
  metricTiles: [
    {
      id: "income" as const,
      title: "Ingresos",
      valueLabel: "$45,230",
      trend: { direction: "up" as const, valueLabel: "12.5%" },
      icon: "cash-outline" as const,
    },
    {
      id: "users" as const,
      title: "Usuarios",
      valueLabel: "1,240",
      trend: { direction: "down" as const, valueLabel: "2.1%" },
      icon: "people-outline" as const,
    },
  ],
  platform: {
    totalLabel: "42",
    deltaLabel: "+8.4%",
    bars: [
      { label: "E", value: 4 },
      { label: "F", value: 3 },
      { label: "M", value: 6, isActive: true },
      { label: "A", value: 5 },
      { label: "M", value: 4 },
      { label: "J", value: 4.8 },
    ],
    isEmpty: false,
  },
  usersGrowth: {
    points: [
      { label: "ENE", value: 1 },
      { label: "FEB", value: 2 },
      { label: "MAR", value: 3 },
      { label: "ABR", value: 5 },
      { label: "MAY", value: 3 },
      { label: "JUN", value: 4 },
    ],
    peakLabel: "Pico: 5",
    isEmpty: false,
  },
  systemUsageRows: [
    {
      id: "api" as const,
      title: "Rendimiento API",
      subtitle: "No disponible",
      icon: "speedometer-outline" as const,
      status: "unavailable" as const,
    },
    {
      id: "storage" as const,
      title: "Almacenamiento",
      subtitle: "No disponible",
      icon: "server-outline" as const,
      status: "unavailable" as const,
    },
  ],
  isLoading: false,
  isRefreshing: false,
  hasPartialError: false,
  refetchAll: jest.fn().mockResolvedValue(undefined),
});

const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("AdminReportsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminReportsDashboard.mockReturnValue(createDashboardVM());
  });

  it("renders complete dashboard structure", () => {
    const { getByText, getAllByText } = renderWithNavigation(
      <AdminReportsScreen />,
    );

    expect(getByText("Reportes")).toBeTruthy();
    expect(getByText("Semanal")).toBeTruthy();
    expect(getByText("Mensual")).toBeTruthy();
    expect(getByText("Anual")).toBeTruthy();
    expect(getByText("Actividad de Plataforma")).toBeTruthy();
    expect(getByText("Crecimiento de Usuarios")).toBeTruthy();
    expect(getByText("Uso del Sistema")).toBeTruthy();
  });

  it("changes active period when selecting annual segment", () => {
    const vm = createDashboardVM();
    mockUseAdminReportsDashboard.mockReturnValueOnce(vm);

    const { getByTestId } = renderWithNavigation(<AdminReportsScreen />);

    fireEvent.press(getByTestId("admin-reports-period-annual"));

    expect(vm.setPeriod).toHaveBeenCalledWith("annual");
  });

  it("shows fallback empty states when reports data is missing", () => {
    mockUseAdminReportsDashboard.mockReturnValueOnce({
      ...createDashboardVM(),
      platform: {
        totalLabel: "0",
        deltaLabel: "0.0%",
        bars: [],
        isEmpty: true,
      },
      usersGrowth: {
        points: [],
        peakLabel: undefined,
        isEmpty: true,
      },
      hasPartialError: true,
    });

    const { getByText, getAllByText } = renderWithNavigation(
      <AdminReportsScreen />,
    );

    expect(
      getByText("Datos parciales, algunos bloques muestran fallback."),
    ).toBeTruthy();
    expect(getByText("Sin datos de flujo para este período")).toBeTruthy();
    expect(
      getByText("Sin actividad de usuarios para este período"),
    ).toBeTruthy();
    expect(getAllByText("No disponible").length).toBeGreaterThanOrEqual(2);
  });
});
