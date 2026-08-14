import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminScreenPerfil } from "../AdminScreenPerfil.web";

const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockToggleTheme = jest.fn();
jest.mock("../../../store/authStore", () => ({ useAuthStore: jest.fn(() => ({ user: { name: "Ada Lovelace", email: "ada@example.com" }, logout: mockLogout })) }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })), useIsDark: jest.fn(() => false), useThemeStore: jest.fn(() => ({ toggleTheme: mockToggleTheme })) }));

describe("Admin profile web surface", () => {
  beforeEach(() => jest.clearAllMocks());
  it("renders admin identity and security controls", () => {
    const { getByText, getByTestId } = render(<NavigationContainer><AdminScreenPerfil /></NavigationContainer>);
    expect(getByText("Perfil administrador")).toBeTruthy();
    expect(getByText("Ada Lovelace")).toBeTruthy();
    expect(getByText("Cuenta operativa")).toBeTruthy();
    fireEvent.press(getByTestId("admin-web-theme-toggle"));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
