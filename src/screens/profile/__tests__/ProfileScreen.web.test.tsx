import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ProfileScreen } from "../ProfileScreen.web";

const mockToggleTheme = jest.fn();
jest.mock("../../../store/authStore", () => ({ useAuthStore: jest.fn(() => ({ user: { name: "Ana Torres", email: "ana@example.com", role: "USER" }, logout: jest.fn().mockResolvedValue(undefined) })) }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })), useIsDark: jest.fn(() => false), useThemeId: jest.fn(() => "ocean"), useThemeStore: jest.fn(() => ({ toggleTheme: mockToggleTheme })) }));

describe("ProfileScreen web surface", () => { beforeEach(() => jest.clearAllMocks()); it("renders identity and preference controls", () => { const { getByText, getByTestId } = render(<NavigationContainer><ProfileScreen /></NavigationContainer>); expect(getByText("Perfil de operador")).toBeTruthy(); expect(getByText("Ana Torres")).toBeTruthy(); fireEvent.press(getByTestId("web-profile-theme")); expect(mockToggleTheme).toHaveBeenCalledTimes(1); }); });
