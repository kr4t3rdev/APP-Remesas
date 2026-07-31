import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
  useExpensesQuery,
  useUpdateExpenseMutation,
} from "./useExpenses";
import { expensesRepository } from "../infrastructure/expenses.repository";
import { queryKeys } from "../../../shared/query/queryKeys";

jest.mock("../infrastructure/expenses.repository", () => ({
  expensesRepository: {
    getExpenses: jest.fn(),
    getExpenseById: jest.fn(),
    createExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
  },
}));

const mockedRepository = expensesRepository as jest.Mocked<
  typeof expensesRepository
>;

const paginatedExpenses = (items: unknown[] = []) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 50,
});

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useExpenses hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches expenses on the first mount with params baked into the queryKey", async () => {
    mockedRepository.getExpenses.mockResolvedValueOnce(paginatedExpenses() as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useExpensesQuery({ category: "otros" }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(mockedRepository.getExpenses).toHaveBeenCalledTimes(1);
      expect(mockedRepository.getExpenses).toHaveBeenCalledWith(
        expect.objectContaining({ category: "otros", page: 1, pageSize: 50 }),
      );
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("uses distinct queryKeys for distinct params", () => {
    mockedRepository.getExpenses.mockResolvedValue(paginatedExpenses() as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = createWrapper(queryClient);

    renderHook(() => useExpensesQuery({ category: "renta" }), { wrapper });
    renderHook(() => useExpensesQuery({ category: "salario" }), { wrapper });

    expect(queryClient.getQueryData(queryKeys.expenses.list({ category: "renta" }))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.expenses.list({ category: "salario" }))).toBeUndefined();
    expect(queryKeys.expenses.list({ category: "renta" })).not.toEqual(
      queryKeys.expenses.list({ category: "salario" }),
    );
  });

  it("loads expense detail by id", async () => {
    mockedRepository.getExpenseById.mockResolvedValueOnce({ id: 4 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useExpenseDetailQuery(4), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getExpenseById).toHaveBeenCalledWith(4);
    expect(result.current.data).toEqual({ id: 4 });
  });


  it("invalidates expenses queries after create", async () => {
    mockedRepository.createExpense.mockResolvedValueOnce({ id: 3 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      description: "Telefono",
      amount: 100,
      currencyId: 1,
      sourceType: "CASH",
      category: "servicios",
      date: "2026-03-06",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["expenses"],
      });
    });
  });

  it("invalidates dependent domains after creating a cash expense", async () => {
    mockedRepository.createExpense.mockResolvedValueOnce({ id: 3 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      description: "Insumos",
      amount: 250,
      currencyId: 1,
      sourceType: "CASH",
      category: "insumos",
      date: "2026-03-07",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["cash"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["bankAccounts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["dashboard"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["reports"],
      });
    });
  });

  it("invalidates the affected bank-account balance cache after creating a bank-account expense", async () => {
    mockedRepository.createExpense.mockResolvedValueOnce({ id: 4 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      description: "Renta",
      amount: 1500,
      currencyId: 1,
      sourceType: "BANK_ACCOUNT",
      sourceBankAccountId: 7,
      category: "renta",
      date: "2026-03-07",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.bankAccounts.balance(7),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.bankAccounts.detail(7),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.bankAccounts.transactions(7),
      });
    });
  });

  it("invalidates detail and list queries after update", async () => {
    mockedRepository.updateExpense.mockResolvedValueOnce({ id: 10 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ id: 10, data: { notes: "Ok" } });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["expenses"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.expenses.detail(10),
      });
    });
  });

  it("invalidates detail and list queries after delete", async () => {
    mockedRepository.deleteExpense.mockResolvedValueOnce(undefined as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync(12);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["expenses"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.expenses.detail(12),
      });
    });
  });

  it("invalidates the deleted expense's bank-account caches", async () => {
    mockedRepository.deleteExpense.mockResolvedValueOnce(undefined as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.expenses.detail(12), {
      id: 12,
      sourceBankAccountId: 7,
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteExpenseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync(12);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.bankAccounts.balance(7),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.bankAccounts.detail(7),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.bankAccounts.transactions(7),
      });
    });
  });
});
