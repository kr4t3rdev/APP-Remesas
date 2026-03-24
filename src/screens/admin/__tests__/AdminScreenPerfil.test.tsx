import React from "react";
import { render } from "@testing-library/react-native";
import { AdminScreenPerfil } from "../AdminScreenPerfil";
import { useAdminProfile } from "../../../modules/admin/application/useAdminProfile";

jest.mock("../../../modules/admin/application/useAdminProfile", () => ({
  useAdminProfile: jest.fn(),
}));

const mockUseAdminProfile = useAdminProfile as jest.Mock;

const createBaseViewModel = () => ({
  user: {
    id: 1,
    email: "admin@test.com",
    name: "Admin Test",
    role: "ADMIN" as const,
    isActive: true,
  },
  stats: {
    totalUsers: 100,
    activeUsers: 85,
    blockedUsers: 5,
    expiringLicenses: 3,
    dailyRevenue: 1500.5,
    activeLicenses: 80,
  },
  recentAuditLogs: [
    {
      id: 1,
      action: "USER_CREATED",
      targetUser: "John Doe",
      adminName: "Admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      action: "LICENSE_EXTENDED",
      targetUser: "Jane Doe",
      adminName: "Admin",
      createdAt: new Date().toISOString(),
    },
  ],
  isAdmin: true,
  isDarkMode: false,
  isLoading: false,
  isRefreshing: false,
  showPasswordForm: false,
  currentPassword: "",
  newPassword: "",
  loading: false,
  statsLoaded: true,
  setShowPasswordForm: jest.fn(),
  setCurrentPassword: jest.fn(),
  setNewPassword: jest.fn(),
  formatNumber: (value: number | string) => String(value),
  themeColors: {
    primary: { 500: "#6366F1", 100: "#E0E7FF" },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    text: { primary: "#1F2937", secondary: "#6B7280", tertiary: "#9CA3AF" },
    background: "#FFFFFF",
    card: "#F9FAFB",
    border: "#E5E7EB",
  },
  themeShadows: {
    sm: {},
    md: {},
  },
  menuItems: [
    {
      id: "theme",
      title: "Modo Oscuro",
      subtitle: "Cambiar a tema oscuro",
      icon: "moon-outline",
      color: "#6366F1",
      onPress: jest.fn(),
    },
    {
      id: "password",
      title: "Cambiar Contraseña",
      subtitle: "Actualizar credenciales",
      icon: "lock-closed-outline",
      color: "#6366F1",
      onPress: jest.fn(),
    },
    {
      id: "licenses",
      title: "Gestión de Licencias",
      subtitle: "3 por vencer",
      icon: "key-outline",
      color: "#F59E0B",
      onPress: jest.fn(),
      badge: 3,
    },
    {
      id: "about",
      title: "Acerca de",
      subtitle: "Versión 1.0.0",
      icon: "information-circle-outline",
      color: "#6B7280",
      onPress: jest.fn(),
    },
  ],
  handleRefresh: jest.fn().mockResolvedValue(undefined),
  handleChangePassword: jest.fn().mockResolvedValue(undefined),
  handleLogout: jest.fn(),
});

describe("AdminScreenPerfil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminProfile.mockReturnValue(createBaseViewModel());
  });

  it("renders admin profile header correctly", () => {
    const { getByText } = render(<AdminScreenPerfil />);

    expect(getByText("Perfil Admin")).toBeTruthy();
    expect(
      getByText("Cuenta administrativa y configuración operativa"),
    ).toBeTruthy();
  });

  it("renders profile card with user information", () => {
    const { getByText } = render(<AdminScreenPerfil />);

    expect(getByText("Admin Test")).toBeTruthy();
    expect(getByText("admin@test.com")).toBeTruthy();
    expect(getByText("ADMIN")).toBeTruthy();
  });

  it("renders admin stats grid when stats are loaded", () => {
    const { getByText } = render(<AdminScreenPerfil />);

    expect(getByText("Total Usuarios")).toBeTruthy();
    expect(getByText("100")).toBeTruthy();
    expect(getByText("Activos")).toBeTruthy();
    expect(getByText("Licencias Activas")).toBeTruthy();
    expect(getByText("Ingresos del Día")).toBeTruthy();
  });

  it("renders configuration menu items", () => {
    const { getByText } = render(<AdminScreenPerfil />);

    expect(getByText("Configuración")).toBeTruthy();
    expect(getByText("Modo Oscuro")).toBeTruthy();
    expect(getByText("Cambiar Contraseña")).toBeTruthy();
    expect(getByText("Gestión de Licencias")).toBeTruthy();
    expect(getByText("Acerca de")).toBeTruthy();
  });

  it("renders recent audit logs section", () => {
    const { getByText } = render(<AdminScreenPerfil />);

    expect(getByText("Actividad Reciente")).toBeTruthy();
    expect(getByText("USER_CREATED")).toBeTruthy();
  });

  it("renders logout button", () => {
    const { getByText } = render(<AdminScreenPerfil />);

    expect(getByText("Cerrar Sesión")).toBeTruthy();
  });

  it("shows loading state when data is loading", () => {
    mockUseAdminProfile.mockReturnValueOnce({
      ...createBaseViewModel(),
      isLoading: true,
      statsLoaded: false,
    });

    const { getByText } = render(<AdminScreenPerfil />);

    // Header should still be visible during loading
    expect(getByText("Perfil Admin")).toBeTruthy();
  });

  it("does not render stats grid when stats are not loaded", () => {
    mockUseAdminProfile.mockReturnValueOnce({
      ...createBaseViewModel(),
      statsLoaded: false,
    });

    const { queryByText } = render(<AdminScreenPerfil />);

    expect(queryByText("Total Usuarios")).toBeNull();
  });
});
