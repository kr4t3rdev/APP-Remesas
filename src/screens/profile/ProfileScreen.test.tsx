import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ProfileScreen } from "./ProfileScreen";

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

jest.mock("../../modules/profile/application/useProfile", () => {
  const query = (data: unknown) => ({
    data,
    isRefetching: false,
    refetch: jest.fn().mockResolvedValue(undefined),
  });

  return {
    useProfileActiveObjectivesQuery: () => query([]),
    useProfileBankAccountsQuery: () => query([]),
    useProfileCashBalancesQuery: () => query([]),
    useProfileDailyReportQuery: () => query(undefined),
  };
});

jest.mock("../../components/animations", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
  FadeInDown: ({ children }: { children: React.ReactNode }) => children,
  ScaleIn: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../components/charts/Charts", () => ({
  StatsCard: () => null,
  CircularProgress: () => null,
}));

describe("ProfileScreen navigation", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("opens Workers from the Profile menu", () => {
    const { getByText } = render(<ProfileScreen />);

    fireEvent.press(getByText("Trabajadores"));

    expect(mockNavigate).toHaveBeenCalledWith("BusinessWorkers");
  });
});
