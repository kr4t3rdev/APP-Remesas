export type WorkerTransaction = {
  id: number;
  workerId: number;
  amount: number;
  type: 'TRANSACTION' | 'BALANCE';
  profit?: number;
  description?: string;
  createdAt: string;
};

export type Worker = {
  id: number;
  name: string;
  phone?: string;
  balance: number;
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
