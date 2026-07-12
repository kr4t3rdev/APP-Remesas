import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AdminResetPasswordModal } from "../AdminResetPasswordModal";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("../../../store/themeStore", () => ({
  useColors: () => ({
    background: "#FFFFFF",
    card: "#F9FAFB",
    text: { primary: "#1F2937", secondary: "#6B7280" },
    primary: { 500: "#3B82F6" },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    border: "#E5E7EB",
  }),
}));

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  isActive: true,
  role: "USER",
  isBanned: false,
};

const renderModal = (props?: Partial<React.ComponentProps<typeof AdminResetPasswordModal>>) =>
  render(
    <AdminResetPasswordModal
      visible
      user={mockUser as any}
      onClose={jest.fn()}
      onConfirm={jest.fn()}
      {...props}
    />,
  );

describe("AdminResetPasswordModal", () => {
  it("renders warning step first", () => {
    const { getByText } = renderModal();

    expect(getByText("Aviso de seguridad")).toBeTruthy();
    expect(getByText("Continuar")).toBeTruthy();
  });

  it("moves to form step after continue", () => {
    const { getByText, getByPlaceholderText } = renderModal();

    fireEvent.press(getByText("Continuar"));

    expect(getByPlaceholderText("Ingresa la nueva contraseña")).toBeTruthy();
    expect(getByText("Aceptar")).toBeTruthy();
  });

  it("shows validation error for weak password", () => {
    const { getByText, getByLabelText, queryByText } = renderModal();

    fireEvent.press(getByText("Continuar"));
    fireEvent.changeText(
      getByLabelText("Nueva contraseña"),
      "weak",
    );
    fireEvent.changeText(
      getByLabelText("Confirmar contraseña"),
      "weak",
    );
    fireEvent.press(getByText("Aceptar"));

    expect(
      getByText(
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula y número",
      ),
    ).toBeTruthy();
    expect(queryByText("Las contraseñas no coinciden")).toBeNull();
  });

  it("calls onConfirm with password when valid", () => {
    const onConfirm = jest.fn();
    const { getByText, getByLabelText } = renderModal({ onConfirm });

    fireEvent.press(getByText("Continuar"));
    fireEvent.changeText(getByLabelText("Nueva contraseña"), "ValidPass123");
    fireEvent.changeText(getByLabelText("Confirmar contraseña"), "ValidPass123");
    fireEvent.press(getByText("Aceptar"));

    expect(onConfirm).toHaveBeenCalledWith("ValidPass123");
  });
});
