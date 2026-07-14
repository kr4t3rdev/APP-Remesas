import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Worker,
  BankAccount,
  CashMovement,
  CashReconciliation,
} from "../../types/business";
import type { Transaction } from "../../types";
import { useTransactionsQuery, useCreateTransactionMutation } from "../../modules/transactions/application/useTransactions";

// Legacy business hooks remain for non-FX tabs; transaction reads/writes use the canonical API module.
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
  return useTransactionsQuery();
};

export const useCreateTransaction = () => {
  return useCreateTransactionMutation();
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
