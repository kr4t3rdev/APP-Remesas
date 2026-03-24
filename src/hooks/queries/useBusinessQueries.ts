import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Transaction,
  Worker,
  BankAccount,
  CashMovement,
  CashReconciliation,
} from "../../types/business";

// Funciones Mock para la API (reemplazar luego con llamadas reales axios/fetch)
const mockFetch = async <T>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// -- Keys --
export const businessKeys = {
  all: ["business"] as const,
  transactions: () => [...businessKeys.all, "transactions"] as const,
  workers: () => [...businessKeys.all, "workers"] as const,
  banks: () => [...businessKeys.all, "banks"] as const,
  currencies: () => [...businessKeys.all, "currencies"] as const,
  cash: () => [...businessKeys.all, "cash"] as const,
};

// -- Transacciones --
export const useTransactions = () => {
  return useQuery({
    queryKey: businessKeys.transactions(),
    queryFn: () => mockFetch<Transaction[]>([]),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTx: Omit<Transaction, "id" | "status">) =>
      mockFetch({
        ...newTx,
        id: Date.now().toString(),
        status: "PENDING",
      } as Transaction),
    onSuccess: () => {
      // Regla 2.5: Invalidación cruzada
      queryClient.invalidateQueries({ queryKey: businessKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: businessKeys.workers() });
      queryClient.invalidateQueries({ queryKey: businessKeys.banks() });
    },
  });
};

// -- Trabajadores --
export const useWorkers = () => {
  return useQuery({
    queryKey: businessKeys.workers(),
    queryFn: () => mockFetch<Worker[]>([]),
  });
};

export const useUpdateWorkerBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workerId: string; amount: number }) => mockFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.workers() });
    },
  });
};

// -- Bancos --
export const useBankAccounts = () => {
  return useQuery({
    queryKey: businessKeys.banks(),
    queryFn: () => mockFetch<BankAccount[]>([]),
  });
};

// -- Caja --
export const useCashMovements = () => {
  return useQuery({
    queryKey: businessKeys.cash(),
    queryFn: () => mockFetch<CashMovement[]>([]),
  });
};
