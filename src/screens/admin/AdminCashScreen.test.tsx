import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AdminCashScreen } from './AdminCashScreen';
import { useRegisterSubscriptionPaymentMutation } from '../../modules/subscriptions/application/useSubscriptions';
import { useBankAccountsQuery } from '../../modules/bank-accounts/application/useBankAccounts';

jest.mock('../../modules/subscriptions/application/useSubscriptions', () => ({
  useRegisterSubscriptionPaymentMutation: jest.fn(),
}));

jest.mock('../../modules/bank-accounts/application/useBankAccounts', () => ({
  useBankAccountsQuery: jest.fn(),
}));

const mockUseRegisterSubscriptionPaymentMutation = useRegisterSubscriptionPaymentMutation as jest.Mock;
const mockUseBankAccountsQuery = useBankAccountsQuery as jest.Mock;

describe('AdminCashScreen', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    mockUseRegisterSubscriptionPaymentMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    mockUseBankAccountsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isRefetching: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requires manual exchange rate to submit', async () => {
    const { getByTestId, getByText } = render(<AdminCashScreen />);

    fireEvent.changeText(getByTestId('cash-user-id-input'), '2');
    fireEvent.changeText(getByTestId('cash-plan-id-input'), '1');

    fireEvent.press(getByText('Registrar cobro'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Complete los campos obligatorios');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('calculates USD to CUP and submits numeric payload', async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: 123 });

    const { getByTestId, getByText } = render(<AdminCashScreen />);

    fireEvent.changeText(getByTestId('cash-user-id-input'), '2');
    fireEvent.changeText(getByTestId('cash-plan-id-input'), '1');
    fireEvent.changeText(getByTestId('cash-amount-usd-input'), '15');
    fireEvent.changeText(getByTestId('cash-exchange-rate-input'), '380');
    fireEvent.changeText(getByTestId('cash-notes-input'), 'Cobro manual');

    const expectedCup = (15 * 380).toLocaleString('es-CU', { minimumFractionDigits: 2 });
    expect(getByText(expectedCup)).toBeTruthy();

    fireEvent.press(getByText('Registrar cobro'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 2,
          planId: 1,
          cycle: 'MONTHLY',
          amountUsd: 15,
          exchangeRateUsed: 380,
          notes: 'Cobro manual',
        }),
      );
    });
  });
});
