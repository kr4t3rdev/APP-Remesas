import React from "react";
import { render } from "@testing-library/react-native";

const mockUseAuthStore = jest.fn();
const mockCheckAuth = jest.fn();

jest.mock("../store/authStore", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({
      name,
      component,
    }: {
      name: string;
      component: React.ComponentType;
    }) => {
      const { Text } = require("react-native");
      return (
        <Text testID={`screen-${name}`}>
          {component.displayName || component.name || "AnonymousComponent"}
        </Text>
      );
    },
  }),
}));

jest.mock("./MainTabs", () => ({
  MainTabs: function MainTabs() {
    return null;
  },
}));

jest.mock("./AdminTabs", () => ({
  AdminTabs: function AdminTabs() {
    return null;
  },
}));

jest.mock("../screens/auth/LoginScreen", () => ({
  LoginScreen: function LoginScreen() {
    return null;
  },
}));

jest.mock("../screens/cash/CashHistoryScreen", () => ({
  CashHistoryScreen: function CashHistoryScreen() {
    return null;
  },
}));

jest.mock("../screens/exchange-rates/ExchangeRatesScreen", () => ({
  ExchangeRatesScreen: function ExchangeRatesScreen() {
    return null;
  },
}));

jest.mock("../screens/bank-accounts/BankAccountsScreen", () => ({
  BankAccountsScreen: function BankAccountsScreen() {
    return null;
  },
}));

jest.mock("../screens/currencies/CurrenciesScreen", () => ({
  CurrenciesScreen: function CurrenciesScreen() {
    return null;
  },
}));

import { AppNavigator } from "./AppNavigator";

describe("AppNavigator role shell selection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckAuth.mockResolvedValue(undefined);
  });

  it("uses admin shell for ADMIN role (user-management first admin flow)", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: mockCheckAuth,
      user: { role: "ADMIN" },
    });

    const { getByText, queryByText } = render(<AppNavigator />);

    expect(getByText("AdminTabs")).toBeTruthy();
    expect(queryByText("MainTabs")).toBeNull();
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });

  it("uses main shell for USER role", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: mockCheckAuth,
      user: { role: "USER" },
    });

    const { getByText, queryByText } = render(<AppNavigator />);

    expect(getByText("MainTabs")).toBeTruthy();
    expect(queryByText("AdminTabs")).toBeNull();
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });

  it("shows login shell when unauthenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: mockCheckAuth,
      user: null,
    });

    const { getByText, queryByText } = render(<AppNavigator />);

    expect(getByText("LoginScreen")).toBeTruthy();
    expect(queryByText("AdminTabs")).toBeNull();
    expect(queryByText("MainTabs")).toBeNull();
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });
});
