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

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useExpenses hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches expenses on the first mount while showing an empty placeholder", async () => {
    mockedRepository.getExpenses.mockResolvedValueOnce([] as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useExpensesQuery({ category: "otros" }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(result.current.data).toEqual([]);

    await waitFor(() => {
      expect(mockedRepository.getExpenses).toHaveBeenCalledTimes(1);
      expect(mockedRepository.getExpenses).toHaveBeenCalledWith({
        category: "otros",
      });
    });
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
        queryKey: queryKeys.expenses.list(),
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
        queryKey: queryKeys.expenses.list(),
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
        queryKey: queryKeys.expenses.list(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.expenses.detail(12),
      });
    });
  });
});
