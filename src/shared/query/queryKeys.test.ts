import { queryKeys } from "./queryKeys";

describe("transaction query keys", () => {
  it("normalizes every list filter dimension", () => {
    expect(queryKeys.transactions.list()).toEqual([
      "transactions",
      "list",
      "all",
      "all",
      "none",
      "none",
    ]);
  });

  it("separates date ranges and transaction classifications", () => {
    expect(
      queryKeys.transactions.list({
        type: "COMPRA",
        operationKind: "TRANSFER",
        startDate: "2026-07-01",
        endDate: "2026-07-16",
      }),
    ).toEqual([
      "transactions",
      "list",
      "COMPRA",
      "TRANSFER",
      "2026-07-01",
      "2026-07-16",
    ]);
  });
});
