import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminUsersScreen } from "../AdminUsersScreen.web";
import { useAdminUsersQuery } from "../../../modules/admin/application/useAdminMetrics";

jest.mock("../../../modules/admin/application/useAdminMetrics", () => ({
  useAdminUsersQuery: jest.fn(),
}));

jest.mock("../../../store/themeStore", () => ({
  useColors: jest.fn(() => ({
    background: "#f6f8fb", card: "#ffffff", border: "#dbe3ed",
    text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" },
    primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c",
  })),
}));

const mockUseAdminUsersQuery = useAdminUsersQuery as jest.Mock;

describe("AdminUsersScreen web surface", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminUsersQuery.mockReturnValue({
      data: [
        { id: 1, name: "Ana Torres", email: "ana@example.com", role: "ADMIN", isActive: true, isBanned: false },
        { id: 2, name: "Luis Pérez", email: "luis@example.com", role: "USER", isActive: false, isBanned: false },
      ],
      isLoading: false,
      isError: false,
    });
  });

  it("renders a searchable directory with summary metrics", () => {
    const { getByText, getByPlaceholderText } = render(<NavigationContainer><AdminUsersScreen /></NavigationContainer>);
    expect(getByText("Directorio de usuarios")).toBeTruthy();
    expect(getByText("Usuarios")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByPlaceholderText("Buscar por nombre o correo")).toBeTruthy();
  });

  it("filters rows from the search field", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<NavigationContainer><AdminUsersScreen /></NavigationContainer>);
    fireEvent.changeText(getByPlaceholderText("Buscar por nombre o correo"), "Ana");
    expect(getByText("Ana Torres")).toBeTruthy();
    expect(queryByText("Luis Pérez")).toBeNull();
  });
});
