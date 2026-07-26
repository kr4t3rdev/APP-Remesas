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

describe("notification query keys", () => {
  it("exports the paginated list key under notifications.list", () => {
    expect(queryKeys.notifications.list()).toEqual(["notifications", "list"]);
  });

  it("exports the infinite scroll key under notifications.infinite", () => {
    expect(queryKeys.notifications.infinite()).toEqual([
      "notifications",
      "infinite",
    ]);
  });

  it("exports the unread count key under notifications.unreadCount", () => {
    expect(queryKeys.notifications.unreadCount()).toEqual([
      "notifications",
      "unreadCount",
    ]);
  });

  it("keeps all three notification keys under the same notifications scope", () => {
    const allRoot = [
      queryKeys.notifications.list(),
      queryKeys.notifications.infinite(),
      queryKeys.notifications.unreadCount(),
    ];
    for (const key of allRoot) {
      expect(key[0]).toBe("notifications");
    }
  });
});

