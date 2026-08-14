import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { WebWorkspaceFrame } from "./WebWorkspaceFrame";

const mockToggleTheme = jest.fn();

jest.mock("../../store/themeStore", () => ({
  useColors: () => ({
    card: "#FFFFFF",
    background: "#F6FAFA",
    border: "#D8E7E9",
    surface: "#EFF7F8",
    text: { primary: "#0F172A", secondary: "#526C72", tertiary: "#94A3B8" },
    primary: { 50: "#ECFEFF", 100: "#CFFAFE", 500: "#0E7490", 600: "#0E7490", 700: "#155E75" },
  }),
  useIsDark: () => false,
  useThemeStore: () => ({ toggleTheme: mockToggleTheme }),
}));

jest.mock("../../store/authStore", () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({ user: { name: "Ana Pérez", email: "ana@example.com" } }),
}));

describe("WebWorkspaceFrame", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders an accessible topbar and workspace content", () => {
    const { getByText, getByLabelText } = render(
      <WebWorkspaceFrame title="Inicio" eyebrow="MESA OPERATIVA">
        <></>
      </WebWorkspaceFrame>,
    );

    expect(getByText("Inicio")).toBeTruthy();
    expect(getByText("Ana Pérez")).toBeTruthy();
    expect(getByLabelText("Buscar en Cashflow")).toBeTruthy();
  });

  it("exposes the theme control as a named button", () => {
    const { getByLabelText } = render(
      <WebWorkspaceFrame title="Caja">
        <></>
      </WebWorkspaceFrame>,
    );

    fireEvent.press(getByLabelText("Cambiar tema"));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
