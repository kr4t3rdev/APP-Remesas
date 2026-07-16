import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ProfileScreen } from "./ProfileScreen";
import * as useProfile from "../../modules/profile/application/useProfile";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, reset: jest.fn() }),
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));

jest.mock("../../store/authStore", () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({
      user: { name: "Test User", email: "test@example.com", role: "USER" },
      logout: jest.fn(),
      changePassword: jest.fn(),
    }),
}));

jest.mock("../../store/themeStore", () => ({
  useThemeStore: (selector: (state: object) => unknown) =>
    selector({ toggleTheme: jest.fn() }),
  useColors: () => ({
    primary: { 500: "#2563EB", 100: "#DBEAFE" },
    secondary: { 500: "#7C3AED" },
    text: { primary: "#111827", secondary: "#6B7280", tertiary: "#9CA3AF" },
    background: "#FFFFFF",
    card: "#FFFFFF",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  }),
  useShadows: () => ({ sm: {}, md: {} }),
  useIsDark: () => false,
}));

jest.mock("../../navigation/TabBarMotionProvider", () => ({
  useTabBarScrollBehavior: () => ({ onScroll: jest.fn(), scrollEventThrottle: 16 }),
  useTabScrollToTop: jest.fn(),
}));

jest.mock("../../modules/profile/application/useProfile", () => ({
  useProfileActiveObjectivesQuery: jest.fn(),
  useProfileBankAccountsQuery: jest.fn(),
  useProfileCashBalancesQuery: jest.fn(),
  useProfileDailyReportQuery: jest.fn(),
}));

jest.mock("../../components/animations", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
  FadeInDown: ({ children }: { children: React.ReactNode }) => children,
  ScaleIn: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../components/charts/Charts", () => ({
  StatsCard: () => null,
  CircularProgress: () => null,
}));

const query = (data: unknown) => ({
  data,
  isRefetching: false,
  refetch: jest.fn().mockResolvedValue(undefined),
});

const makeObjective = (overrides: Partial<{
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  status: string;
}> = {}) => ({
  id: 1,
  name: "Ahorrar para laptop",
  targetAmount: 1000,
  currentAmount: 350,
  percentage: 35,
  status: "ACTIVO",
  currencyId: 1,
  currency: { id: 1, code: "USD", name: "Dólar", symbol: "$", isActive: true },
  remaining: 650,
  ...overrides,
});

describe("ProfileScreen", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.mocked(useProfile.useProfileActiveObjectivesQuery).mockReturnValue(query([]));
    jest.mocked(useProfile.useProfileBankAccountsQuery).mockReturnValue(query([]));
    jest.mocked(useProfile.useProfileCashBalancesQuery).mockReturnValue(query([]));
    jest.mocked(useProfile.useProfileDailyReportQuery).mockReturnValue(query(undefined));
  });

  it("opens Workers from the Profile menu", () => {
    const { getByText } = render(<ProfileScreen />);

    fireEvent.press(getByText("Trabajadores"));

    expect(mockNavigate).toHaveBeenCalledWith("BusinessWorkers");
  });

  it("renders active objectives section when objectives exist", () => {
    jest.mocked(useProfile.useProfileActiveObjectivesQuery).mockReturnValue(
      query([makeObjective({ id: 1, name: "Ahorrar para laptop", percentage: 35, currentAmount: 350, targetAmount: 1000 })])
    );

    const { getByText } = render(<ProfileScreen />);

    expect(getByText("Objetivos Activos")).toBeTruthy();
    expect(getByText("Ahorrar para laptop")).toBeTruthy();
    expect(getByText(/350/)).toBeTruthy();
    expect(getByText(/1.000/)).toBeTruthy();
  });

  it("does not render objectives section when no active objectives exist", () => {
    const { queryByText } = render(<ProfileScreen />);

    expect(queryByText("Objetivos Activos")).toBeNull();
  });

  it("renders multiple objectives in a horizontal scroll", () => {
    const objectives = [
      makeObjective({ id: 1, name: "Objetivo 1", percentage: 50 }),
      makeObjective({ id: 2, name: "Objetivo 2", percentage: 75 }),
    ];
    jest.mocked(useProfile.useProfileActiveObjectivesQuery).mockReturnValue(query(objectives));

    const { getByText } = render(<ProfileScreen />);

    expect(getByText("Objetivo 1")).toBeTruthy();
    expect(getByText("Objetivo 2")).toBeTruthy();
  });

  it("only shows objectives with ACTIVE status", () => {
    const objectives = [
      makeObjective({ id: 1, name: "Activo", status: "ACTIVO" }),
      makeObjective({ id: 2, name: "Completado", status: "COMPLETADO" }),
      makeObjective({ id: 3, name: "Pausado", status: "PAUSADO" }),
    ];
    jest.mocked(useProfile.useProfileActiveObjectivesQuery).mockReturnValue(query(objectives));

    const { getByText, queryByText } = render(<ProfileScreen />);

    expect(getByText("Activo")).toBeTruthy();
    expect(queryByText("Completado")).toBeNull();
    expect(queryByText("Pausado")).toBeNull();
  });
});
