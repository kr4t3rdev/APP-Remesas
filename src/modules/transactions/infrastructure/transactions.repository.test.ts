import api from "../../../services/api";
import { transactionsRepository } from "./transactions.repository";

jest.mock("../../../services/api", () => ({ post: jest.fn() }));

it("reuses the caller-provided idempotency key for retries", async () => {
  jest.mocked(api.post).mockResolvedValue({ data: { id: 1 } } as any);
  const request = { type: "COMPRA" as const, currencyId: 1, amount: 10, rate: 240, idempotencyKey: "intent-1" };
  await transactionsRepository.createTransaction(request);
  await transactionsRepository.createTransaction(request);
  expect(api.post).toHaveBeenNthCalledWith(1, "/fx-operations/transfers", expect.not.objectContaining({ idempotencyKey: expect.anything() }), { headers: { "Idempotency-Key": "intent-1" } });
  expect(api.post).toHaveBeenNthCalledWith(2, "/fx-operations/transfers", expect.anything(), { headers: { "Idempotency-Key": "intent-1" } });
});
