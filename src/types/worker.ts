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
};

export type Worker = {
  id: number;
  userId?: number;
  name: string;
  phone?: string;
  photoUrl?: string;
  initials?: string;
  balance: number | string;
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

export type CreateTransactionInput = {
  workerId: number;
  amount: number;
  profit?: number;
  description?: string;
};

export type AddBalanceInput = {
  workerId: number;
  amount: number;
};
