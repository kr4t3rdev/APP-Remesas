import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { AdminServicesScreen } from "./AdminServicesScreen";
import * as adminMetricsApi from "../../api/adminMetricsApi";

// Mock API
jest.mock("../../api/adminMetricsApi", () => ({
  fetchAdminMetrics: jest.fn(),
}));

// Mock Navigation (if needed)
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe("AdminServicesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header and titles correctly", async () => {
    (adminMetricsApi.fetchAdminMetrics as jest.Mock).mockResolvedValue({
      activeCount: 1240,
      expiredCount: 85,
      activeDelta: "+12%",
      expiredDelta: "-5%",
    });

    const { getByText, getAllByText } = render(<AdminServicesScreen />);

    // expect(getByText('Admin Hub')).toBeTruthy();
    expect(getByText("Servicios")).toBeTruthy();
    expect(getByText("Gestión Principal")).toBeTruthy();
    expect(getByText("Gestión Principal")).toBeTruthy();
    expect(getByText("Acciones Rápidas")).toBeTruthy();
  });

  it("renders metrics cards with data", async () => {
    (adminMetricsApi.fetchAdminMetrics as jest.Mock).mockResolvedValue({
      activeCount: 1240,
      expiredCount: 85,
      activeDelta: "+12%",
      expiredDelta: "-5%",
    });

    const { getByText } = render(<AdminServicesScreen />);

    await waitFor(() => {
      expect(getByText("1,240")).toBeTruthy();
    });
  });

  it("shows an error state instead of fabricated metrics when the API fails", async () => {
    (adminMetricsApi.fetchAdminMetrics as jest.Mock).mockRejectedValue(
      new Error("API down"),
    );

    const { getByText, queryByText } = render(<AdminServicesScreen />);

    await waitFor(() => {
      expect(
        getByText("No se pudieron cargar los indicadores. Reintenta."),
      ).toBeTruthy();
    });
    expect(queryByText("1,240")).toBeNull();
  });

  it("renders management cards", async () => {
    const { getByText } = render(<AdminServicesScreen />);

    expect(getByText("Gestión de Licencias")).toBeTruthy();
    expect(getByText("Control de acceso y renovaciones")).toBeTruthy();
    expect(getByText("Configurar ahora")).toBeTruthy();

    expect(getByText("Planes de Suscripción")).toBeTruthy();
    expect(getByText("Editar ofertas y niveles de precio")).toBeTruthy();
    expect(getByText("Ver planes")).toBeTruthy();
  });

  it("renders quick action tiles", async () => {
    const { getByText } = render(<AdminServicesScreen />);

    expect(getByText("Nueva")).toBeTruthy();
    expect(getByText("Exportar")).toBeTruthy();
    expect(getByText("Alertas")).toBeTruthy();
    // 'Otra' is returned by translation key admin.actions.otra
    expect(getByText("Otra")).toBeTruthy();
  });
});
