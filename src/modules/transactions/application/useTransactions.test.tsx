import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import { useCreateTransactionMutation } from "./useTransactions";
import { transactionsRepository } from "../infrastructure/transactions.repository";
import { queryKeys } from "../../../shared/query/queryKeys";

jest.mock("../infrastructure/transactions.repository", () => ({
  transactionsRepository: { createTransaction: jest.fn() },
}));

it("invalidates exact worker payment keys when an FX transaction changes a worker balance", async () => {
  jest.mocked(transactionsRepository.createTransaction).mockResolvedValue({ transaction: {} } as never);
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = jest.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useCreateTransactionMutation(), { wrapper });

  await result.current.mutateAsync({
    type: "COMPRA",
    currencyId: 2,
    amount: 10,
    rate: 250,
    idempotencyKey: "stable-intent",
    workerId: 42,
    workerCurrencyId: 3,
    workerProfit: 1,
  });

  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.workerPayments.list() });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.workerPayments.detail(42) });
});
