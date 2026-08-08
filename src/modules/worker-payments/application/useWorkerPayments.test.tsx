import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useCreateWorkerMutation,
  useDeleteWorkerMutation,
  useWorkerDetailQuery,
  useWorkersQuery,
  useUpdateWorkerMutation,
  useAddBalanceMutation,
  useDepositMutation,
} from "./useWorkerPayments";
import { workerPaymentsRepository } from "../infrastructure/workerPayments.repository";
import { queryKeys } from "../../../shared/query/queryKeys";

jest.mock("../infrastructure/workerPayments.repository", () => ({
  workerPaymentsRepository: {
    getWorkers: jest.fn(),
    getWorkerById: jest.fn(),
    createWorker: jest.fn(),
    updateWorker: jest.fn(),
    deleteWorker: jest.fn(),
    addBalance: jest.fn(),
    deposit: jest.fn(),
  },
}));

const mockedRepository = workerPaymentsRepository as jest.Mocked<
  typeof workerPaymentsRepository
>;

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useWorkerPayments hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useWorkersQuery", () => {
    it("fetches workers on the first mount while showing an empty placeholder", async () => {
      mockedRepository.getWorkers.mockResolvedValueOnce([]);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const { result } = renderHook(() => useWorkersQuery(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.data).toEqual([]);
      await waitFor(() =>
        expect(mockedRepository.getWorkers).toHaveBeenCalledTimes(1),
      );
    });
  });

  describe("useWorkerDetailQuery", () => {
    it("loads worker detail by id", async () => {
      const mockWorker = { id: 1, name: "Juan Pérez", balance: 100 } as never;
      mockedRepository.getWorkerById.mockResolvedValueOnce(mockWorker);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const { result } = renderHook(() => useWorkerDetailQuery(1), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedRepository.getWorkerById).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(mockWorker);
    });

    it("does not fetch when id is undefined", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const { result } = renderHook(
        () => useWorkerDetailQuery(undefined as never),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockedRepository.getWorkerById).not.toHaveBeenCalled();
    });
  });

  describe("useCreateWorkerMutation", () => {
    it("creates worker and invalidates list", async () => {
      const mockWorker = { id: 1, name: "Nuevo Trabajador" } as never;
      mockedRepository.createWorker.mockResolvedValueOnce(mockWorker);
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateWorkerMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        name: "Nuevo Trabajador",
        phone: "1234567890",
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.workerPayments.list(),
        });
      });
    });
  });

  describe("useUpdateWorkerMutation", () => {
    it("updates worker and invalidates queries", async () => {
      const mockWorker = { id: 1, name: "Trabajador Actualizado" } as never;
      mockedRepository.updateWorker.mockResolvedValueOnce(mockWorker);
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateWorkerMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        id: 1,
        input: { name: "Trabajador Actualizado" },
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.workerPayments.list(),
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.workerPayments.detail(1),
        });
      });
    });
  });

  describe("useDeleteWorkerMutation", () => {
    it("deletes worker and invalidates list", async () => {
      mockedRepository.deleteWorker.mockResolvedValueOnce(undefined as never);
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteWorkerMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync(1);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.workerPayments.list(),
        });
      });
    });
  });

  describe("useAddBalanceMutation", () => {
    it("adds balance and invalidates queries", async () => {
      const mockWorker = { id: 1, balance: 1300 } as never;
      mockedRepository.addBalance.mockResolvedValueOnce(mockWorker);
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAddBalanceMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({ workerId: 1, amount: 300 });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.workerPayments.list(),
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.workerPayments.detail(1),
        });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.cash.balances() });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bankAccounts.list() });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions.positions() });
      });
    });
  });

  describe("useDepositMutation", () => {
    it("invalidates worker and money-source keys after depositing a worker balance", async () => {
      mockedRepository.deposit.mockResolvedValueOnce({ id: 1, balance: 700 } as never);
      const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useDepositMutation(), { wrapper: createWrapper(queryClient) });

      await result.current.mutateAsync({ workerId: 1, amount: 100, destinationType: "CASH", currencyId: 2 });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workerPayments.list() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workerPayments.detail(1) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.cash.balances() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bankAccounts.list() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions.positions() });
    });
  });
});
