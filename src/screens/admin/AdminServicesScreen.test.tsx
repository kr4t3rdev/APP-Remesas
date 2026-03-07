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

describe('AdminServicesScreen', () => {
  const assignMutate = jest.fn();
  const createPlanMutate = jest.fn();
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

    mockUseSubscriptionLicensesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    mockUseAssignLicenseMutation.mockReturnValue({
      mutateAsync: assignMutate,
      isPending: false,
    });

    mockUseCreatePlanMutation.mockReturnValue({
      mutateAsync: createPlanMutate,
      isPending: false,
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('validates required selects before assigning license', async () => {
    const { getByText } = render(<AdminServicesScreen />);

    fireEvent.press(getByText('Asignar licencia'));

    await waitFor(() => {
      expect(getByText('Selecciona un usuario')).toBeTruthy();
      expect(getByText('Selecciona un plan')).toBeTruthy();
    });

    expect(assignMutate).not.toHaveBeenCalled();
  });

  it('creates plan with fixed pricing and success feedback', async () => {
    createPlanMutate.mockResolvedValueOnce({ id: 99 });

    const { getByTestId } = render(<AdminServicesScreen />);

    fireEvent.changeText(getByTestId('services-create-plan-name'), 'Plan Plus');
    fireEvent.changeText(getByTestId('services-create-plan-description'), 'Plan creado desde test');
    fireEvent.press(getByTestId('services-create-plan-button'));

    await waitFor(() => {
      expect(createPlanMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Plan Plus',
          description: 'Plan creado desde test',
          monthlyUsd: 15,
          semiannualUsd: 85.5,
          annualUsd: 162,
        }),
      );
    });

    expect(alertSpy).toHaveBeenCalledWith('Éxito', 'Plan creado correctamente');
  });

  it('shows create-plan error feedback when mutation fails', async () => {
    createPlanMutate.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Error de validación',
        },
      },
    });

    const { getByTestId } = render(<AdminServicesScreen />);

    fireEvent.changeText(getByTestId('services-create-plan-name'), 'Plan inválido');
    fireEvent.press(getByTestId('services-create-plan-button'));

    await waitFor(() => {
      expect(createPlanMutate).toHaveBeenCalledTimes(1);
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Error de validación');
  });
});
