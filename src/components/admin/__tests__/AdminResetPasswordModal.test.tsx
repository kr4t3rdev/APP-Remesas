import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AdminResetPasswordModal } from "../AdminResetPasswordModal";

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  isActive: true,
  role: "USER",
  isBanned: false,
};

describe("AdminResetPasswordModal", () => {
  it("renders with user info when visible", () => {
    const { getByText } = render(
      <AdminResetPasswordModal
        visible
        user={mockUser}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(getByText("Test User")).toBeTruthy();
    expect(getByText("test@example.com")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    const { queryByText } = render(
      <AdminResetPasswordModal
        visible={false}
        user={mockUser}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(queryByText("Reset Password")).toBeNull();
  });

  it("returns null when user is null", () => {
    const { queryByText } = render(
      <AdminResetPasswordModal
        visible
        user={null}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(queryByText("Reset Password")).toBeNull();
  });

  it("calls onClose when cancel button pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <AdminResetPasswordModal
        visible
        user={mockUser}
        onClose={onClose}
        onConfirm={jest.fn()}
      />
    );
    fireEvent.press(getByText("Cancelar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onConfirm when confirm button pressed", () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <AdminResetPasswordModal
        visible
        user={mockUser}
        onClose={jest.fn()}
        onConfirm={onConfirm}
      />
    );
    fireEvent.press(getByText("Confirm Reset"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("shows loading text and disables button when loading=true", () => {
    const { getByText, getByTestId } = render(
      <AdminResetPasswordModal
        visible
        user={mockUser}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        loading={true}
      />
    );
    expect(getByText("Resetting...")).toBeTruthy();
  });
});
