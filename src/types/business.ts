export interface Transaction {
  id: string;
  date: string;
  type: "BUY" | "SELL";
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  rate: number;
  status: "PENDING" | "RECONCILED";
}

export interface Worker {
  id: string;
  name: string;
  currentBalance: number;
  accumulatedProfit: number;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  currencyCode: string;
  balance: number;
}

export interface CashMovement {
  id: string;
  date: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  amount: number;
  description: string;
}

export interface CashReconciliation {
  id: string;
  date: string;
  registeredBalance: number;
  countedBalance: number;
  result: "SOBRANTE" | "FALTANTE" | "CUADRADO";
  difference: number;
}
