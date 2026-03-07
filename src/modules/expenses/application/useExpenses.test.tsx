import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useCreateExpenseMutation, useDeleteExpenseMutation, useExpenseDetailQuery, useExpensesQuery, usePendingExpensesQuery, useUpdateExpenseMutation } from './useExpenses';
import { expensesRepository } from '../infrastructure/expenses.repository';
import { queryKeys } from '../../../shared/query/queryKeys';

jest.mock('../infrastructure/expenses.repository', () => ({
  expensesRepository: {
    getExpenses: jest.fn(),
    getExpenseById: jest.fn(),
    createExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
    getPendingExpenses: jest.fn(),
  },
}));

const mockedRepository = expensesRepository as jest.Mocked<typeof expensesRepository>;

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useExpenses hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads expenses list with params', async () => {
    mockedRepository.getExpenses.mockResolvedValueOnce([{ id: 1 } as never]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useExpensesQuery({ category: 'otros' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getExpenses).toHaveBeenCalledWith({ category: 'otros' });
    expect(result.current.data).toEqual([{ id: 1 }]);
  });

  it('loads expense detail by id', async () => {
    mockedRepository.getExpenseById.mockResolvedValueOnce({ id: 4 } as never);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useExpenseDetailQuery(4), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getExpenseById).toHaveBeenCalledWith(4);
    expect(result.current.data).toEqual({ id: 4 });
  });

  it('loads pending expenses', async () => {
    mockedRepository.getPendingExpenses.mockResolvedValueOnce([{ id: 8 } as never]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => usePendingExpensesQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getPendingExpenses).toHaveBeenCalled();
    expect(result.current.data).toEqual([{ id: 8 }]);
  });

  it('invalidates expenses queries after create', async () => {
    mockedRepository.createExpense.mockResolvedValueOnce({ id: 3 } as never);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      description: 'Telefono',
      amount: 100,
      currencyId: 1,
      category: 'servicios',
      date: '2026-03-06',
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.list() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.pending() });
    });
  });

  it('invalidates detail and list queries after update', async () => {
    mockedRepository.updateExpense.mockResolvedValueOnce({ id: 10 } as never);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ id: 10, data: { notes: 'Ok' } });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.list() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.pending() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.detail(10) });
    });
  });

  it('invalidates detail and list queries after delete', async () => {
    mockedRepository.deleteExpense.mockResolvedValueOnce(undefined as never);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync(12);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.list() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.pending() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.expenses.detail(12) });
    });
  });
});
