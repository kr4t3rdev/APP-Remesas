import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AdminServicesScreen } from "./AdminServicesScreen";
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
import {
  usePlansCatalogQuery,
  useCreatePlanMutation,
} from "../../modules/plans/application/usePlans";
import {
  useAssignLicenseMutation,
  useSubscriptionLicensesQuery,
} from "../../modules/subscriptions/application/useSubscriptions";
import { useOperationalUsersQuery } from "../../modules/users/application/useUsers";

jest.mock("../../modules/plans/application/usePlans", () => ({
  usePlansCatalogQuery: jest.fn(),
  useCreatePlanMutation: jest.fn(),
}));

jest.mock("../../modules/subscriptions/application/useSubscriptions", () => ({
  useSubscriptionLicensesQuery: jest.fn(),
  useAssignLicenseMutation: jest.fn(),
}));

jest.mock("../../modules/users/application/useUsers", () => ({
  useOperationalUsersQuery: jest.fn(),
}));

const mockUsePlansCatalogQuery = usePlansCatalogQuery as jest.Mock;
const mockUseCreatePlanMutation = useCreatePlanMutation as jest.Mock;
const mockUseSubscriptionLicensesQuery =
  useSubscriptionLicensesQuery as jest.Mock;
const mockUseAssignLicenseMutation = useAssignLicenseMutation as jest.Mock;
const mockUseOperationalUsersQuery = useOperationalUsersQuery as jest.Mock;

describe("AdminServicesScreen integration flow", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

    mockUseOperationalUsersQuery.mockReturnValue({
      data: [
        { id: 1, name: "User Uno", email: "user1@test.com", role: "USER" },
      ],
      isLoading: false,
      isError: false,
    });

    mockUsePlansCatalogQuery.mockReturnValue({
      data: [
        {
          id: 10,
          name: "Plan Base",
          isActive: true,
          monthlyUsd: 15,
          semiannualUsd: 85.5,
          annualUsd: 162,
        },
      ],
      isLoading: false,
      isError: false,
    });

    mockUseCreatePlanMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("renders the current services management surface", () => {
    const { getByText } = render(<AdminServicesScreen />);
    expect(getByText("Gestión Principal")).toBeTruthy();
    expect(getByText("Gestión de Licencias")).toBeTruthy();
  });
});
