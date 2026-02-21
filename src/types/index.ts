export type Currency = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
};

export type ExchangeRate = {
  id: number;
  currencyId: number;
  currency: Currency;
  referenceRate: number;
  buyMargin: number;
  sellMargin: number;
  buyRate: number;
  sellRate: number;
  effectiveDate: string;
};

export type TransactionType = 'COMPRA' | 'VENTA';
export type ReconciliationStatus = 'PENDIENTE' | 'RECONCILIADO';

export type Transaction = {
  id: number;
  type: TransactionType;
  currencyId: number;
  currency: Currency;
  amount: number;
  rate: number;
  totalCup: number;
  marginProfit: number;
  status: ReconciliationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CashBalance = {
  id: number;
  currencyId: number;
  currency: Currency;
  balance: number;
};

export type CashAudit = {
  id: number;
  currencyId: number;
  currency: Currency;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  notes?: string;
  createdAt: string;
};

export type BankAccount = {
  id: number;
  name: string;
  bankName: string;
  currencyId: number;
  currency: Currency;
  accountNumber: string;
  balance: number;
  isActive: boolean;
};

export type ExpenseCategory = 'renta' | 'servicios' | 'salario' | 'insumos' | 'otros';

export type Expense = {
  id: number;
  description: string;
  amount: number;
  currencyId: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  status: ReconciliationStatus;
  notes?: string;
};

export type ObjectiveStatus = 'ACTIVO' | 'COMPLETADO' | 'PAUSADO';

export type Objective = {
  id: number;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currencyId: number;
  currency: Currency;
  bankAccountId?: number;
  bankAccount?: BankAccount;
  status: ObjectiveStatus;
  percentage: number;
  remaining: number;
};

export type User = {
  id: number;
  email: string;
  name: string;
};

export type AuthResponse = {
  access_token: string;
  user: User;
};

export type DailyReport = {
  date: string;
  transactions: {
    total: number;
    compras: number;
    ventas: number;
    totalCompras: number;
    totalVentas: number;
  };
  expenses: {
    total: number;
    totalAmount: number;
    byCategory: Record<string, { count: number; total: number }>;
  };
  profit: {
    margin: number;
    net: number;
  };
};

export type ApiError = {
  message: string;
  statusCode: number;
};
