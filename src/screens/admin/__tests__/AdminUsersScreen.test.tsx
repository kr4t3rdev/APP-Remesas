import { Alert } from "react-native";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AdminUsersScreen } from "../AdminUsersScreen";
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

  it("shows explicit separation between CRUD and operational controls", () => {
    const { getByText, getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-user-row-2"));

    expect(getByText("Bloque CRUD (datos base)")).toBeTruthy();
    expect(getByText("Controles operativos (no-CRUD)")).toBeTruthy();
  });

  it("shows Add user CTA in bottom CRUD area", () => {
    const { getByTestId } = render(<AdminUsersScreen />);
    expect(getByTestId("admin-add-user-bottom-cta")).toBeTruthy();
  });

  it("requires reason for sensitive action before mutating", async () => {
    const { getByTestId, getByText } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-user-row-2"));
    fireEvent.press(getByTestId("admin-user-action-FORCE_PASSWORD_RESET"));

    fireEvent.press(getByText("Confirmar y aplicar"));

    await waitFor(() => {
      expect(
        getByText("El motivo es obligatorio para esta acción"),
      ).toBeTruthy();
    });

    expect(mutateAction).not.toHaveBeenCalled();
  });

  it("executes sensitive action when reason is provided", async () => {
    mutateAction.mockResolvedValueOnce({ success: true });

    const { getByTestId, getByText } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-user-row-2"));
    fireEvent.press(getByTestId("admin-user-action-CHANGE_ROLE"));
    fireEvent.changeText(
      getByTestId("user-action-reason-input"),
      "Escalación temporal de soporte",
    );
    fireEvent.press(getByText("Confirmar y aplicar"));

    await waitFor(() => {
      expect(mutateAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 2,
          request: expect.objectContaining({
            actionType: "CHANGE_ROLE",
            reason: "Escalación temporal de soporte",
          }),
        }),
      );
    });
  });

  it("does not persist changes when sensitive action confirmation is canceled", async () => {
    const { getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByTestId("admin-user-row-2"));
    fireEvent.press(getByTestId("admin-user-action-SUSPEND_ACCOUNT"));
    fireEvent.press(getByTestId("user-action-cancel-button"));

    await waitFor(() => {
      expect(mutateAction).not.toHaveBeenCalled();
    });
  });

  it("creates a user from the explicit Add user CRUD entry point with extended payload", async () => {
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

    fireEvent.press(getByText("Add user"));
    fireEvent.changeText(getByTestId("add-user-name-input"), "Nuevo Admin");
    fireEvent.changeText(
      getByTestId("add-user-email-input"),
      "nuevo@cambios.com",
    );
    fireEvent.changeText(getByTestId("add-user-last-name-input"), "Pérez");
    fireEvent.changeText(getByTestId("add-user-phone-input"), "+53 555 12 34");
    fireEvent.changeText(getByTestId("add-user-locale-input"), "es-CU");
    fireEvent.changeText(
      getByTestId("add-user-timezone-input"),
      "America/Havana",
    );
    fireEvent.changeText(getByTestId("add-user-license-plan-id-input"), "2");
    fireEvent.press(getByTestId("add-user-submit-button"));

    await waitFor(() => {
      expect(mutateCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Nuevo Admin",
          email: "nuevo@cambios.com",
          role: "USER",
          profile: expect.objectContaining({ lastName: "Pérez" }),
          contact: expect.objectContaining({ phone: "+53 555 12 34" }),
          preferences: expect.objectContaining({
            locale: "es-CU",
            timezone: "America/Havana",
          }),
          licenseSetup: expect.objectContaining({ planId: 2 }),
        }),
      );
    });
  });

  it("keeps optional extended fields when required inputs are missing", async () => {
    const { getByText, getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByText("Add user"));
    fireEvent.changeText(getByTestId("add-user-last-name-input"), "Temporal");
    fireEvent.press(getByTestId("add-user-submit-button"));

    await waitFor(() => {
      expect(getByText("El nombre es obligatorio")).toBeTruthy();
      expect(getByText("El email es obligatorio")).toBeTruthy();
    });

    expect(getByTestId("add-user-last-name-input").props.value).toBe(
      "Temporal",
    );
    expect(mutateCreate).not.toHaveBeenCalled();
  });

  it("shows duplicate-email error in Add user modal and keeps modal open", async () => {
    mutateCreate.mockRejectedValueOnce({
      response: {
        data: {
          message: "El email ya está registrado",
        },
      },
    });

    const { getByText, getByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByText("Add user"));
    fireEvent.changeText(getByTestId("add-user-name-input"), "Duplicado");
    fireEvent.changeText(getByTestId("add-user-email-input"), "user2@test.com");
    fireEvent.press(getByText("Crear usuario"));

    await waitFor(() => {
      expect(getByText("El email ya está registrado")).toBeTruthy();
    });

    expect(mutateCreate).toHaveBeenCalledTimes(1);
  });

  it("cancels Add user flow without side effects", () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <AdminUsersScreen />,
    );

    fireEvent.press(getByText("Add user"));
    fireEvent.changeText(getByTestId("add-user-name-input"), "Temporal");
    fireEvent.press(getByTestId("add-user-cancel-button"));

    expect(mutateCreate).not.toHaveBeenCalled();
    expect(queryByTestId("add-user-name-input")).toBeNull();
  });

  it("filters users by active and blocked segments for operational targeting", () => {
    const { getByText, queryByTestId } = render(<AdminUsersScreen />);

    fireEvent.press(getByText("Activos"));
    expect(queryByTestId("admin-user-row-1")).toBeTruthy();
    expect(queryByTestId("admin-user-row-2")).toBeTruthy();
    expect(queryByTestId("admin-user-row-3")).toBeNull();

    fireEvent.press(getByText("Bloqueados"));
    expect(queryByTestId("admin-user-row-3")).toBeTruthy();
    expect(queryByTestId("admin-user-row-1")).toBeNull();
    expect(queryByTestId("admin-user-row-2")).toBeNull();
  });
});
