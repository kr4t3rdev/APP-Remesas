export type WorkerTransaction = {
  id: number;
  workerId: number;
  amount: number | string;
  type: "TRANSACTION" | "BALANCE_ADD";
  profit?: number | string;
  balanceBefore: number | string;
  balanceAfter: number | string;
  description?: string;
  createdAt: string;
  currencyId?: number;
  currency?: import("./index").Currency;
};

export type WorkerBalance = {
  id: number;
  workerId: number;
  currencyId: number;
  currency?: import("./index").Currency;
  balance: number | string;
  accumulatedProfit: number | string;
  totalDelivered: number | string;
};

export type Worker = {
  id: number;
  userId?: number;
  name: string;
  phone?: string;
  photoUrl?: string;
  initials?: string;
  balances?: WorkerBalance[];
  /** @deprecated API compatibility while old records are migrated. */
  balance?: number | string;
  accumulatedProfit?: number | string;
  totalDelivered?: number | string;
  transactions?: WorkerTransaction[];
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkerInput = {
  name: string;
  phone?: string;
};

export type UpdateWorkerInput = Partial<CreateWorkerInput>;

export type AddBalanceInput = {
  workerId: number;
  amount: number;
  sourceType: "CASH" | "BANK_ACCOUNT";
  sourceId?: number;
  currencyId: number;
};

export type DepositInput = {
  workerId: number;
  amount: number;
  destinationType: "CASH" | "BANK_ACCOUNT";
  destinationId?: number;
  currencyId: number;
};
