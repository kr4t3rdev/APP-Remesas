import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AdminServicesScreen } from './AdminServicesScreen';
import { usePlansCatalogQuery, useCreatePlanMutation } from '../../modules/plans/application/usePlans';
import {
  useAssignLicenseMutation,
  useSubscriptionLicensesQuery,
} from '../../modules/subscriptions/application/useSubscriptions';
import { useOperationalUsersQuery } from '../../modules/users/application/useUsers';

jest.mock('../../modules/plans/application/usePlans', () => ({
  usePlansCatalogQuery: jest.fn(),
  useCreatePlanMutation: jest.fn(),
}));

jest.mock('../../modules/subscriptions/application/useSubscriptions', () => ({
  useSubscriptionLicensesQuery: jest.fn(),
  useAssignLicenseMutation: jest.fn(),
}));

jest.mock('../../modules/users/application/useUsers', () => ({
  useOperationalUsersQuery: jest.fn(),
}));

const mockUsePlansCatalogQuery = usePlansCatalogQuery as jest.Mock;
const mockUseCreatePlanMutation = useCreatePlanMutation as jest.Mock;
const mockUseSubscriptionLicensesQuery = useSubscriptionLicensesQuery as jest.Mock;
const mockUseAssignLicenseMutation = useAssignLicenseMutation as jest.Mock;
const mockUseOperationalUsersQuery = useOperationalUsersQuery as jest.Mock;

describe('AdminServicesScreen integration flow', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    mockUseOperationalUsersQuery.mockReturnValue({
      data: [{ id: 1, name: 'User Uno', email: 'user1@test.com', role: 'USER' }],
      isLoading: false,
      isError: false,
    });

    mockUsePlansCatalogQuery.mockReturnValue({
      data: [{ id: 10, name: 'Plan Base', isActive: true, monthlyUsd: 15, semiannualUsd: 85.5, annualUsd: 162 }],
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

  it('selects user/plan, assigns license, and reflects refreshed list', async () => {
    let licenses: any[] = [];

    mockUseSubscriptionLicensesQuery.mockImplementation(() => ({
      data: licenses,
      isLoading: false,
      isError: false,
    }));

    const assignMutate = jest.fn(async ({ userId, planId, cycle }: { userId: number; planId: number; cycle: string }) => {
      licenses = [
        {
          id: 501,
          userId,
          user: { id: 1, name: 'User Uno', email: 'user1@test.com' },
          planId,
          cycle,
          state: 'ACTIVE',
          expiresAt: '2026-12-31T00:00:00.000Z',
        },
      ];
      return licenses[0];
    });

    mockUseAssignLicenseMutation.mockReturnValue({
      mutateAsync: assignMutate,
      isPending: false,
    });

    const { getByLabelText, rerender, getAllByTestId, getByTestId } = render(<AdminServicesScreen />);

    fireEvent.press(getByLabelText('Usuario: User Uno'));
    fireEvent.press(getByLabelText('Plan: Plan Base'));
    fireEvent.press(getByTestId('services-assign-license-button'));

    await waitFor(() => {
      expect(assignMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          planId: 10,
          cycle: 'MONTHLY',
        }),
      );
    });

    rerender(<AdminServicesScreen />);

    await waitFor(() => {
      expect(getAllByTestId('services-license-row')).toHaveLength(1);
    });
  });
});
