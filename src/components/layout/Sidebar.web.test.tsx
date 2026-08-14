import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Sidebar } from "./Sidebar.web";

const mockToggleSidebar = jest.fn();
const mockNavigation = {
  dispatch: jest.fn(),
  getState: () => ({ index: 0, routes: [{ name: "Home" }] }),
};

jest.mock("../../store/themeStore", () => ({
  useColors: () => ({
    card: "#FFFFFF",
    border: "#D8E7E9",
    text: { primary: "#0F172A", secondary: "#526C72", tertiary: "#94A3B8" },
    primary: { 50: "#ECFEFF", 100: "#CFFAFE", 300: "#67E8F9", 500: "#0E7490", 600: "#0E7490", 700: "#155E75" },
  }),
}));

jest.mock("../../hooks/useResponsive", () => ({
  BREAKPOINTS: { tablet: 768, desktop: 1024 },
  useResponsive: () => ({ width: 1200, sidebarMode: "expanded" }),
}));

jest.mock("../../store/responsiveStore", () => ({
  useResponsiveStore: () => ({ isSidebarCollapsed: "expanded", toggleSidebar: mockToggleSidebar }),
}));

jest.mock("../../components/branding/AppLogo", () => ({
  AppLogo: () => {
    const { Text } = require("react-native");
    return <Text testID="web-sidebar-logo">Logo</Text>;
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
  CommonActions: { navigate: (payload: object) => ({ type: "NAVIGATE", payload }) },
}));

describe("Sidebar.web", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders role-aware navigation and dispatches the selected route", () => {
    const { getByTestId, getByLabelText } = render(
      <Sidebar navigation={mockNavigation as any} />,
    );

    expect(getByTestId("web-sidebar-logo")).toBeTruthy();
    expect(getByLabelText("Inicio")).toBeTruthy();
    fireEvent.press(getByLabelText("Caja"));

    expect(mockNavigation.dispatch).toHaveBeenCalled();
  });

  it("exposes the collapse control as a labelled keyboard target", () => {
    const { getByLabelText } = render(
      <Sidebar navigation={mockNavigation as any} />,
    );

    fireEvent.press(getByLabelText("Colapsar sidebar"));
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("nests tab navigation through Main on stack-level workspace pages", () => {
    mockNavigation.getState = () => ({ index: 0, routes: [{ name: "CashHistory" }] });
    const { getByLabelText } = render(
      <Sidebar navigation={mockNavigation as any} rootWorkspace />,
    );

    fireEvent.press(getByLabelText("Caja"));

    expect(mockNavigation.dispatch).toHaveBeenCalledWith({
      type: "NAVIGATE",
      payload: { name: "Main", params: { screen: "Cash" } },
    });
  });
});
