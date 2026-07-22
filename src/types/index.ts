export type Currency = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
};

export type CurrenciesWithPrimary = {
  currencies: Currency[];
  primaryCurrencyId: number | null;
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
  isNewRate?: boolean;
};

export type RateSource = "MANUAL" | "SYSTEM";

export type RateHistory = {
  id: number;
  userId: number;
  currencyFromId: number;
  currencyFrom?: Currency;
  currencyToId: number;
  currencyTo?: Currency;
  rate: number;
  source: RateSource;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
};

export type TransactionType = "COMPRA" | "VENTA";
export type ExpenseSourceType = "CASH" | "BANK_ACCOUNT";

export type Transaction = {
  id: number;
  type: TransactionType;
  operationKind?: "TRANSFER" | "REMITTANCE";
  currencyId: number;
  currency: Currency;
  amount: number;
  rate: number;
  totalCup: number;
  marginProfit: number;
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

export type CashAdjustmentType = "INGRESO" | "EGRESO";

export type CashAdjustment = {
  id: number;
  currencyId: number;
  currency: Currency;
  amount: number;
  type: CashAdjustmentType;
  reason: string;
  createdAt: string;
};

export type CashOverviewMovement = {
  id: string;
  kind: "TRANSACTION" | "ADJUSTMENT" | "EXPENSE";
  type: TransactionType | CashAdjustmentType;
  direction: "IN" | "OUT";
  title: string;
  description: string;
  amount: number;
  totalBase: number | null;
  currency: Currency;
  createdAt: string;
};

export type CashOverview = {
  asOf: string;
  primaryCurrency: Currency | null;
  currencies: Currency[];
  balances: CashBalance[];
  recentMovements: CashOverviewMovement[];
  latestAudits: CashAudit[];
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

export type ExpenseCategory =
  | "renta"
  | "servicios"
  | "salario"
  | "insumos"
  | "otros";

export type Expense = {
  id: number;
  description: string;
  amount: number;
  currencyId: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  sourceType: ExpenseSourceType;
  sourceBankAccountId?: number;
  sourceBankAccount?: BankAccount;
  notes?: string;
};

export type CreateExpenseInput = {
  description: string;
  amount: number;
  currencyId: number;
  sourceType: ExpenseSourceType;
  sourceBankAccountId?: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export type ObjectiveStatus = "ACTIVO" | "COMPLETADO" | "PAUSADO";

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

export type CreateObjectiveInput = {
  name: string;
  description?: string;
  targetAmount: number;
  currencyId: number;
  bankAccountId?: number;
};

export type UpdateObjectiveInput = Partial<CreateObjectiveInput>;

export type ObjectiveProgress = {
  objectiveId: number;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
  remaining: number;
  estimatedCompletionDate?: string;
};

export type UpdateObjectiveStatusInput = {
  status: ObjectiveStatus;
};

export type UserRole = "ADMIN" | "USER";

export type User = {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  primaryCurrencyId?: number;
  isActive?: boolean;
  failedLoginAttempts?: number;
  blockedUntil?: string | null;
  isBanned?: boolean;
  bannedUntil?: string | null;
  mustChangePassword?: boolean;
};

export type AuthResponse = {
  access_token: string;
  mustChangePassword?: boolean;
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

export type CategorySummary = Record<string, { count: number; total: number }>;

export type CurrencyTransactionSummary = Record<
  string,
  { compras: number; ventas: number; count: number }
>;

export type CurrencyExpenseSummary = Record<
  string,
  { total: number; count: number }
>;

export type DailyBreakdownItem = {
  date: string;
  transactions: number;
  expenses: number;
};

export type PeriodReport = {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTransactions: number;
    totalExpensesCount: number;
    totalExpensesAmount: number;
    totalProfit: number;
  };
  dailyBreakdown: DailyBreakdownItem[];
  transactionsByCurrency: CurrencyTransactionSummary;
  expensesByCategory: CategorySummary;
};

export type ProfitReportTransaction = {
  id: number;
  type: TransactionType;
  currency: string;
  amount: number;
  rate: number;
  totalCup: number;
  marginProfit: number;
  createdAt: string;
};

export type ProfitByCurrencySummary = Record<
  string,
  { marginProfit: number; count: number }
>;

export type ProfitReport = {
  period: {
    startDate: string;
    endDate: string;
  };
  totalMarginProfit: number;
  totalCompras: number;
  totalVentas: number;
  netFlow: number;
  byCurrency: ProfitByCurrencySummary;
  transactions: ProfitReportTransaction[];
};

export type CurrencyReport = {
  currencyId: number;
  currency: Currency | null;
  currentBalance: number;
  totalTransactions: number;
  totalCompras: number;
  totalVentas: number;
  transactions: Transaction[];
};

export type ExpensesReport = {
  total: number;
  totalAmount: number;
  byCategory: CategorySummary;
  byCurrency: CurrencyExpenseSummary;
  expenses: Expense[];
};

export type AccountReportItem = BankAccount & {
  transactionCount: number;
};

export type AccountsReport = {
  totalAccounts: number;
  totalBalance: number;
  accounts: AccountReportItem[];
};

export type ObjectivesReport = {
  total: number;
  activos: number;
  completados: number;
  pausados: number;
  objectives: Objective[];
};

export type CashFlowReport = {
  period: {
    startDate: string;
    endDate: string;
  };
  inflows: {
    ventas: number;
    adjustments: number;
  };
  outflows: {
    compras: number;
    expenses: number;
    adjustments: number;
  };
};

export type AuditSummaryReport = {
  totalAudits: number;
  withDiscrepancies: number;
  totalDiscrepancy: number;
  audits: CashAudit[];
};

export type ApiError = {
  message: string;
  statusCode: number;
};

export type BillingCycle = "MONTHLY" | "SEMIANNUAL" | "ANNUAL";
export type LicenseState =
  | "TRIAL"
  | "ACTIVE"
  | "GRACE"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED";

export type UserAccessState = {
  isActive: boolean;
  failedLoginAttempts: number;
  blockedUntil: string | null;
  isBanned: boolean;
  bannedUntil: string | null;
  licenseExpiresAt: string | null;
  licenseState: LicenseState;
};

export type Plan = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  monthlyUsd: number;
  semiannualUsd: number;
  annualUsd: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePlanInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  monthlyUsd?: number;
  semiannualUsd?: number;
  annualUsd?: number;
};

export type UserLicense = {
  id: number;
  userId: number;
  user?: Pick<User, "id" | "name" | "email">;
  planId: number;
  plan?: Plan;
  state: LicenseState;
  cycle: BillingCycle;
  startedAt: string;
  expiresAt: string;
  graceUntil?: string | null;
  cancelledAt?: string | null;
  lastPaymentAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPayment = {
  id: number;
  userId: number;
  userLicenseId?: number | null;
  planId: number;
  cycle: BillingCycle;
  amountUsd: number;
  exchangeRateUsed: number;
  amountCup: number;
  paidAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminKpiSnapshot = {
  totalUsers: number;
  activeUsers30d: number;
  newUsersPeriod: number;
  suspendedUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByPlan: Record<string, number>;
  licensesByState: Record<LicenseState, number>;
  expiringIn7d: number;
  expiringIn30d: number;
  churnPeriod: number;
  reactivatedPeriod: number;
  trialToPaidConversionPct: number;
  renewalRatePct: number;
  cancellationRatePct: number;
  mrrEstimateCup: number;
  arpuEstimateCup: number;
  revenueAtRiskCup: number;
};

export type AdminNotificationEvent =
  | {
      type: "NEW_USER_REGISTERED";
      userId: number;
      email: string;
      createdAt: string;
      channel?: "IN_APP" | "WEBHOOK" | "EMAIL";
    }
  | {
      type: "USER_TEMP_BLOCKED";
      userId: number;
      blockedUntil: string;
      failedAttempts: number;
      channel?: "IN_APP" | "WEBHOOK" | "EMAIL";
    }
  | {
      type: "USER_BANNED";
      userId: number;
      bannedUntil: string | null;
      reason: string;
      channel?: "IN_APP" | "WEBHOOK" | "EMAIL";
    };

export type AdminAuditLog = {
  id: number;
  actorUserId: number;
  targetUserId?: number | null;
  action: string;
  reason?: string | null;
  createdAt: string;
};

export type AdminUserControlActionType =
  | "TEMP_BLOCK"
  | "UNBLOCK"
  | "SUSPEND_ACCOUNT"
  | "REACTIVATE_ACCOUNT"
  | "FORCE_PASSWORD_RESET"
  | "REVOKE_ALL_SESSIONS"
  | "RESET_PASSWORD"
  | "CHANGE_ROLE"
  | "SUSPEND_LICENSE"
  | "EXTEND_LICENSE";

export type AdminUserControlRequest = {
  actionType: AdminUserControlActionType;
  reason: string;
  payload?: {
    newRole?: UserRole;
    blockUntil?: string;
    extendDays?: number;
    licenseId?: number;
  };
};

export type AdminCreateUserRequest = {
  name: string;
  email: string;
  role: UserRole;
  profile?: {
    lastName?: string;
    documentId?: string;
    department?: string;
    position?: string;
  };
  contact?: {
    phone?: string;
    alternateEmail?: string;
    address?: string;
  };
  access?: {
    isActive?: boolean;
    forcePasswordChangeOnFirstLogin?: boolean;
    sendInviteEmail?: boolean;
  };
  security?: {
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    notes?: string;
  };
  preferences?: {
    locale?: string;
    timezone?: string;
  };
  licenseSetup?: {
    planId?: number;
    cycle?: BillingCycle;
    startImmediately?: boolean;
  };
};

export type AdminUserDetail = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isBanned: boolean;
  blockedUntil: string | null;
  failedLoginAttempts: number;
  license: {
    id: number;
    state: LicenseState;
    expiresAt: string;
    planId: number;
  } | null;
  recentActions: Array<{
    action: string;
    reason: string | null;
    createdAt: string;
    actorUserId: number;
  }>;
};

export type AdminOperativeUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  isBanned?: boolean;
  blockedUntil?: string | null;
  failedLoginAttempts?: number;
};

export type RateHistoryEntry = {
  id: number;
  currencyFromId: number;
  currencyToId: number;
  rate: number;
  source: "MANUAL" | "SYSTEM";
  createdAt: string;
};

export type RateStats = {
  min: number;
  max: number;
  average: number;
  median: number;
  trend: "up" | "down" | "stable";
  changePercentage: number;
};

export type CreateRateHistoryInput = {
  currencyFromId: number;
  currencyToId: number;
  rate: number;
};

export type CurrencyDetail = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export * from "./worker";
