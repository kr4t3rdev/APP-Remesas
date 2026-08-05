import { selectTopWorkersByBalance } from "./topWorkersSelector";
import type { Worker, ExchangeRate } from "../../../types";

describe("selectTopWorkersByBalance selector", () => {
  const mockRates: ExchangeRate[] = [
    {
      id: 1,
      currencyId: 1, // USD
      currency: { id: 1, code: "USD", name: "Dólar", symbol: "$", isActive: true },
      referenceRate: 120,
      buyMargin: 0,
      sellMargin: 0,
      buyRate: 118,
      sellRate: 120,
      effectiveDate: "2026-07-14T10:00:00.000Z",
    },
    {
      id: 2,
      currencyId: 2, // EUR
      currency: { id: 2, code: "EUR", name: "Euro", symbol: "€", isActive: true },
      referenceRate: 130,
      buyMargin: 0,
      sellMargin: 0,
      buyRate: 128,
      sellRate: 132,
      effectiveDate: "2026-07-14T10:00:00.000Z",
    },
  ];

  const mockWorkers: Worker[] = [
    {
      id: 1,
      name: "Juan Pérez",
      initials: "JP",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 10,
          workerId: 1,
          currencyId: 10, // CUP (Primary)
          balance: 500,
          accumulatedProfit: 0,
          totalDelivered: 500,
        },
        {
          id: 11,
          workerId: 1,
          currencyId: 1, // USD
          balance: 10, // 10 * 120 = 1200 CUP
          accumulatedProfit: 0,
          totalDelivered: 10,
        },
      ], // Total CUP: 500 + 1200 = 1700
    },
    {
      id: 2,
      name: "Ana Gomez",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 20,
          workerId: 2,
          currencyId: 10, // CUP
          balance: 2000,
          accumulatedProfit: 0,
          totalDelivered: 2000,
        },
      ], // Total CUP: 2000
    },
    {
      id: 3,
      name: "Pedro Martinez",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 30,
          workerId: 3,
          currencyId: 2, // EUR
          balance: 5, // 5 * 132 = 660 CUP
          accumulatedProfit: 0,
          totalDelivered: 5,
        },
      ], // Total CUP: 660
    },
  ];

  it("returns empty array if no workers or primaryCurrencyId", () => {
    expect(selectTopWorkersByBalance(undefined, mockRates, { primaryCurrencyId: 10 })).toEqual([]);
    expect(selectTopWorkersByBalance(mockWorkers, mockRates, { primaryCurrencyId: undefined })).toEqual([]);
  });

  it("calculates total balance in primary currency and ranks workers correctly", () => {
    const result = selectTopWorkersByBalance(mockWorkers, mockRates, { primaryCurrencyId: 10 });
    expect(result).toHaveLength(3);

    // Ana Gomez should be #1 (2000 CUP)
    expect(result[0]).toEqual({
      id: 2,
      name: "Ana Gomez",
      initials: "ANG",
      totalBalanceInPrimary: 2000,
      hasUnconvertedBalance: false,
    });

    // Juan Pérez should be #2 (1700 CUP)
    expect(result[1]).toEqual({
      id: 1,
      name: "Juan Pérez",
      initials: "JP",
      totalBalanceInPrimary: 1700,
      hasUnconvertedBalance: false,
    });

    // Pedro Martinez should be #3 (660 CUP)
    expect(result[2]).toEqual({
      id: 3,
      name: "Pedro Martinez",
      initials: "PEM",
      totalBalanceInPrimary: 660,
      hasUnconvertedBalance: false,
    });
  });

  it("caps results to specified limit", () => {
    const result = selectTopWorkersByBalance(mockWorkers, mockRates, { primaryCurrencyId: 10, limit: 2 });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
  });

  it("flags unconverted balance when rate is missing", () => {
    const workerWithNoRate: Worker = {
      id: 4,
      name: "Sin Tasa",
      createdAt: "",
      updatedAt: "",
      balances: [
        {
          id: 40,
          workerId: 4,
          currencyId: 99, // Unkonwn currency without rate
          balance: 100,
          accumulatedProfit: 0,
          totalDelivered: 100,
        },
      ],
    };
    const result = selectTopWorkersByBalance([workerWithNoRate], mockRates, { primaryCurrencyId: 10 });
    expect(result[0].hasUnconvertedBalance).toBe(true);
    expect(result[0].totalBalanceInPrimary).toBe(0);
  });
});
