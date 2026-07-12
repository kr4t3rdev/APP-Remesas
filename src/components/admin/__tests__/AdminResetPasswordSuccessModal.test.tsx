import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AdminResetPasswordSuccessModal } from "../AdminResetPasswordSuccessModal";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("AdminResetPasswordSuccessModal", () => {
  it("renders success message with email address", () => {
    const { getByText } = render(
      <AdminResetPasswordSuccessModal
        visible
        userEmail="test@example.com"
        onBackToProfile={jest.fn()}
        onGoToDashboard={jest.fn()}
      />
    );
    expect(getByText("Password Reset Successful")).toBeTruthy();
    expect(getByText(/test@example.com/)).toBeTruthy();
  });

  it("does not render when not visible", () => {
    const { queryByText } = render(
      <AdminResetPasswordSuccessModal
        visible={false}
        userEmail="test@example.com"
        onBackToProfile={jest.fn()}
        onGoToDashboard={jest.fn()}
      />
    );
    expect(queryByText("Password Reset Successful")).toBeNull();
  });

  it("calls onBackToProfile when back button pressed", () => {
    const onBackToProfile = jest.fn();
    const { getByText } = render(
      <AdminResetPasswordSuccessModal
        visible
        userEmail="test@example.com"
        onBackToProfile={onBackToProfile}
        onGoToDashboard={jest.fn()}
      />
    );
    fireEvent.press(getByText("Back to Profile"));
    expect(onBackToProfile).toHaveBeenCalled();
  });

  it("calls onGoToDashboard when dashboard button pressed", () => {
    const onGoToDashboard = jest.fn();
    const { getByText } = render(
      <AdminResetPasswordSuccessModal
        visible
        userEmail="test@example.com"
        onBackToProfile={jest.fn()}
        onGoToDashboard={onGoToDashboard}
      />
    );
    fireEvent.press(getByText("Go to Dashboard"));
    expect(onGoToDashboard).toHaveBeenCalled();
  });
});
