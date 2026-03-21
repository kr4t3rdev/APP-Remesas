import React from 'react';
import { render } from '@testing-library/react-native';
import { TransactionsTab } from '../tabs/TransactionsTab';
import * as businessQueries from '../../../hooks/queries/useBusinessQueries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock de la navegación o dependencias si es necesario
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('TransactionsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    jest.spyOn(businessQueries, 'useTransactions').mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { getByTestId } = render(<TransactionsTab />, { wrapper });
    // La ActivityIndicator no tiene testID por defecto, pero podemos verificar que no hay texto
    expect(() => getByTestId('flatlist')).toThrow();
  });

  it('renders transaction list when data is available (using TransactionCard)', () => {
    jest.spyOn(businessQueries, 'useTransactions').mockReturnValue({
      data: [
        { id: '1', date: '2023-10-24T09:42:00Z', type: 'BUY', amount: 5000, sourceCurrency: 'USD', targetCurrency: 'CUP', rate: 250, status: 'RECONCILED' },
      ],
      isLoading: false,
    } as any);

    const { getByText } = render(<TransactionsTab />, { wrapper });
    // Verifica elementos dentro de TransactionCard
    expect(getByText('Currency Exchange')).toBeTruthy();
    expect(getByText('BUY')).toBeTruthy();
    expect(getByText('5,000.00 USD')).toBeTruthy();
    expect(getByText('1,250,000 CUP')).toBeTruthy();
    expect(getByText('RECONCILED')).toBeTruthy();
  });
});
