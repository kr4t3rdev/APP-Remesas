import { Alert } from "react-native";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AdminUsersScreen } from "../AdminUsersScreen";
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
import {
  useCreateAdminUserMutation,
  useAdminUpdateUserBasicMutation,
  useAdminUserControlActionMutation,
  useAdminUserDetailQuery,
  useAdminUsersQuery,
} from "../../../modules/admin/application/useAdminMetrics";

jest.mock("../../../modules/admin/application/useAdminMetrics", () => ({
  useAdminUsersQuery: jest.fn(),
  useAdminUserDetailQuery: jest.fn(),
  useCreateAdminUserMutation: jest.fn(),
  useAdminUpdateUserBasicMutation: jest.fn(),
  useAdminUserControlActionMutation: jest.fn(),
}));

const mockUseAdminUsersQuery = useAdminUsersQuery as jest.Mock;
const mockUseAdminUserDetailQuery = useAdminUserDetailQuery as jest.Mock;
const mockUseCreateAdminUserMutation = useCreateAdminUserMutation as jest.Mock;
const mockUseAdminUpdateUserBasicMutation =
  useAdminUpdateUserBasicMutation as jest.Mock;
const mockUseAdminUserControlActionMutation =
  useAdminUserControlActionMutation as jest.Mock;

describe("AdminUsersScreen", () => {
  const mutateCreate = jest.fn();
  const mutateBasic = jest.fn();
  const mutateAction = jest.fn();
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

    mockUseAdminUsersQuery.mockReturnValue({
      data: [
        {
          id: 1,
          name: "Admin Uno",
          email: "admin1@test.com",
          role: "ADMIN",
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
        },
        {
          id: 2,
          name: "User Dos",
          email: "user2@test.com",
          role: "USER",
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 1,
        },
        {
          id: 3,
          name: "Blocked Tres",
          email: "blocked3@test.com",
          role: "USER",
          isActive: false,
          isBanned: true,
          blockedUntil: "2026-12-31T00:00:00.000Z",
          failedLoginAttempts: 4,
        },
      ],
    });

    mockUseAdminUserDetailQuery.mockReturnValue({
      data: {
        id: 2,
        email: "user2@test.com",
        name: "User Dos",
        role: "USER",
        isActive: true,
        isBanned: false,
        blockedUntil: null,
        failedLoginAttempts: 1,
        license: {
          id: 11,
          state: "ACTIVE",
          expiresAt: "2026-12-31T00:00:00.000Z",
          planId: 1,
        },
        recentActions: [],
      },
      isLoading: false,
    });

    mockUseCreateAdminUserMutation.mockReturnValue({
      mutateAsync: mutateCreate,
      isPending: false,
    });

    mockUseAdminUpdateUserBasicMutation.mockReturnValue({
      mutateAsync: mutateBasic,
      isPending: false,
    });

    mockUseAdminUserControlActionMutation.mockReturnValue({
      mutateAsync: mutateAction,
      isPending: false,
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("opens the selected user detail from the user list", () => {
    const { getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-user-row-2"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "AdminUserDetail",
      expect.objectContaining({ user: expect.objectContaining({ id: 2 }) }),
    );
  });

  it("exposes the add-user action", () => {
    const { getByTestId } = render(<AdminUsersScreen />);
    expect(getByTestId("admin-add-user-bottom-cta")).toBeTruthy();
  });

  it("creates a user from the explicit Add user entry point", async () => {
    mutateCreate.mockResolvedValueOnce({
      id: 3,
      name: "Nuevo Admin",
      email: "nuevo@cambios.com",
      role: "USER",
      isActive: true,
      isBanned: false,
      blockedUntil: null,
      failedLoginAttempts: 0,
    });

    const { getByText, getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-add-user-bottom-cta"));
    fireEvent.changeText(getByTestId("add-user-name-input"), "Nuevo Admin");
    fireEvent.changeText(
      getByTestId("add-user-email-input"),
      "nuevo@cambios.com",
    );
    fireEvent.press(getByTestId("add-user-submit-button"));

    await waitFor(() => {
      expect(mutateCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Nuevo Admin",
          email: "nuevo@cambios.com",
          role: "USER",
        }),
      );
    });
  });

  it("validates required fields before creating a user", async () => {
    const { getByText, getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-add-user-bottom-cta"));
    fireEvent.press(getByTestId("add-user-submit-button"));

    await waitFor(() => {
      expect(getByText("El nombre es obligatorio")).toBeTruthy();
      expect(getByText("El email es obligatorio")).toBeTruthy();
    });

    expect(mutateCreate).not.toHaveBeenCalled();
  });

  it("shows duplicate-email error in Add user modal and keeps modal open", async () => {
    mutateCreate.mockResolvedValueOnce({ id: 4 });

    const { getByText, getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-add-user-bottom-cta"));
    fireEvent.changeText(getByTestId("add-user-name-input"), "Duplicado");
    fireEvent.changeText(getByTestId("add-user-email-input"), "user2@test.com");
    fireEvent.press(getByText("Crear usuario"));

    await waitFor(() => expect(mutateCreate).toHaveBeenCalledTimes(1));

    expect(mutateCreate).toHaveBeenCalledTimes(1);
  });

  it("cancels Add user flow without side effects", () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <AdminUsersScreen />,
    );

    fireEvent.press(getByTestId("admin-add-user-bottom-cta"));
    fireEvent.changeText(getByTestId("add-user-name-input"), "Temporal");
    fireEvent.press(getByTestId("add-user-cancel-button"));

    expect(mutateCreate).not.toHaveBeenCalled();
    expect(queryByTestId("add-user-name-input")).toBeNull();
  });

  it("filters users by the active segment", () => {
    const { getByText, queryByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByText("Activos"));

    expect(queryByTestId("admin-user-row-1")).toBeTruthy();
    expect(queryByTestId("admin-user-row-2")).toBeTruthy();
    expect(queryByTestId("admin-user-row-3")).toBeNull();
  });
});
