import api from "../../../services/api";
import { transactionsRepository } from "./transactions.repository";

jest.mock("../../../services/api", () => ({ get: jest.fn(), post: jest.fn() }));

it("forwards operationKind when listing remittances", async () => {
  jest.mocked(api.get).mockResolvedValue({ data: [] } as any);

  await transactionsRepository.getTransactions({ operationKind: "REMITTANCE" });

  expect(api.get).toHaveBeenCalledWith("/transactions", {
    params: { operationKind: "REMITTANCE" },
  });
});

it("reuses the caller-provided idempotency key for retries", async () => {
  jest.mocked(api.post).mockResolvedValue({ data: { transaction: { id: 1 } } } as any);
  const request = { type: "COMPRA" as const, currencyId: 1, amount: 10, rate: 240, idempotencyKey: "intent-1" };
  await transactionsRepository.createTransaction(request);
  await transactionsRepository.createTransaction(request);
  expect(api.post).toHaveBeenNthCalledWith(1, "/fx-operations/transfers", expect.not.objectContaining({ idempotencyKey: expect.anything() }), { headers: { "Idempotency-Key": "intent-1" } });
  expect(api.post).toHaveBeenNthCalledWith(2, "/fx-operations/transfers", expect.anything(), { headers: { "Idempotency-Key": "intent-1" } });
});

it("forwards remittance classification and active-rate persistence in the body", async () => {
  jest.mocked(api.post).mockResolvedValue({ data: { transaction: { id: 1, requestedRate: 245, rate: 245.01 } } } as any);

  await transactionsRepository.createTransaction({
    type: "COMPRA",
    currencyId: 1,
    amount: 10,
    rate: 245,
    operationKind: "REMITTANCE",
    persistRate: true,
    idempotencyKey: "remittance-1",
  });

  expect(api.post).toHaveBeenCalledWith(
    "/fx-operations/transfers",
    expect.objectContaining({ operationKind: "REMITTANCE", persistRate: true, rate: "245", amount: "10" }),
    { headers: { "Idempotency-Key": "remittance-1" } },
  );
});

it("posts the controlled historical opening contract", async () => {
  jest.mocked(api.post).mockResolvedValue({ data: { position: { currencyId: 2 }, movement: { id: 9 } } } as any);

  await transactionsRepository.openPosition({ currencyId: 2, openingCost: 250.125 });

  expect(api.post).toHaveBeenCalledWith("/fx-operations/positions/open", {
    currencyId: 2,
    openingCost: "250.125",
  });
});

it("preserves position review status from the report contract", async () => {
  jest.mocked(api.get).mockResolvedValue({
    data: { positions: [{ currencyId: 2, currency: "USD", saldo: 50, costoPromedio: null, availableForSale: false, reviewStatus: "UNREVIEWED" }] },
  } as any);

  const positions = await transactionsRepository.getPositions();

  expect(positions[0]).toEqual(expect.objectContaining({ reviewStatus: "UNREVIEWED" }));
});
