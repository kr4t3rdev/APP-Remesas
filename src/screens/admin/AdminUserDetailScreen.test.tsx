import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { AdminUserDetailScreen } from "./AdminUserDetailScreen";
import {
  useAdminUserControlActionMutation,
  useAdminUpdateUserBasicMutation,
  useAdminUserDetailQuery,
} from "../../modules/admin/application/useAdminMetrics";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AdminResetPasswordModal } from "../../components/admin/AdminResetPasswordModal";
import { AdminResetPasswordSuccessModal } from "../../components/admin/AdminResetPasswordSuccessModal";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
  Feather: () => null,
}));

// Mocks
jest.mock("../../modules/admin/application/useAdminMetrics", () => ({
  useAdminUserControlActionMutation: jest.fn(),
  useAdminUpdateUserBasicMutation: jest.fn(),
  useAdminUserDetailQuery: jest.fn(),
  useAdminDeleteUserMutation: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock("../../store/themeStore", () => ({
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

jest.mock("../../components/admin/AdminResetPasswordModal", () => ({
  AdminResetPasswordModal: jest.fn(() => null),
}));
jest.mock("../../components/admin/AdminResetPasswordSuccessModal", () => ({
  AdminResetPasswordSuccessModal: jest.fn(() => null),
}));

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockRoute = {
  params: {
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      isActive: true,
      role: "USER",
    },
  },
};

describe("AdminUserDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRoute as jest.Mock).mockReturnValue(mockRoute);

    // Default mocks
    (useAdminUserControlActionMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    (useAdminUpdateUserBasicMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    const { useAdminDeleteUserMutation } =
      require("../../modules/admin/application/useAdminMetrics");
    (useAdminDeleteUserMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("renders user details correctly from route params when query loads", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    expect(getByText("Test User")).toBeTruthy();
    expect(getByText("User")).toBeTruthy();
    expect(getByText("ID: 1")).toBeTruthy();
  });

  it("displays full user details including license info when query succeeds", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: "Test User Full",
        email: "test@example.com",
        isActive: true,
        role: "USER",
        license: {
          id: 123,
          state: "ACTIVE",
          expiresAt: "2024-12-31",
          planId: 1,
        },
      },
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    expect(getByText("Test User Full")).toBeTruthy();
    expect(getByText("LICENSED")).toBeTruthy();
  });

  it("navigates to license detail when Manage License is pressed and user has license", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        isActive: true,
        role: "USER",
        license: {
          id: 999,
          state: "ACTIVE",
        },
      },
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    fireEvent.press(getByText("Manage License"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("AdminLicenseDetail", {
      licenseId: 999,
    });
  });

  it("navigates to licenses list when Manage License is pressed and user has NO license", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        isActive: true,
        role: "USER",
        license: null,
      },
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    fireEvent.press(getByText("Manage License"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("AdminLicensesList");
  });

  it("shows operational actions", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    expect(getByText("Temporary Block")).toBeTruthy();
    expect(getByText("Suspend Account")).toBeTruthy();
    expect(getByText("Force Password Reset")).toBeTruthy();
    expect(getByText("Revoke Sessions")).toBeTruthy();
    expect(getByText("Change Role")).toBeTruthy();
  });

  it("renders Reset Password action card", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    expect(getByText("Reset Password")).toBeTruthy();
    expect(getByText("Change user password immediately")).toBeTruthy();
  });

  it("opens reset password modal when action card is pressed", () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    fireEvent.press(getByText("Reset Password"));

    // Modal should receive visible={true}
    // Get the last call with visible=true
    const calls = (AdminResetPasswordModal as jest.Mock).mock.calls;
    const visibleCall = calls.find((call) => call[0]?.visible === true);

    expect(visibleCall).toBeDefined();
    expect(visibleCall?.[0]).toMatchObject({
      visible: true,
      user: expect.objectContaining({ id: 1 }),
    });
  });

  it("passes new password to reset password action", async () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        isActive: true,
        role: "USER",
      },
      isLoading: false,
    });

    (useAdminUserControlActionMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);

    fireEvent.press(getByText("Reset Password"));

    const call = (AdminResetPasswordModal as jest.Mock).mock.calls.find(
      (entry) => entry[0]?.visible === true,
    );

    expect(call?.[0].onConfirm).toBeInstanceOf(Function);
  });
});
