export const queryKeys = {
  dashboard: {
    dailyReport: (date?: string) =>
      ["dashboard", "dailyReport", date ?? "today"] as const,
    cashBalances: () => ["dashboard", "cashBalances"] as const,
    exchangeRates: () => ["dashboard", "exchangeRates"] as const,
    recentTransactions: (limit?: number) =>
      ["dashboard", "recentTransactions", limit ?? "all"] as const,
    activeObjectives: () => ["dashboard", "activeObjectives"] as const,
    recentExpenses: (limit?: number) =>
      ["dashboard", "recentExpenses", limit ?? "all"] as const,
    fxPerformance: () => ["dashboard", "fxPerformance"] as const,
  },
  transactions: {
    list: (params?: {
      type?: "COMPRA" | "VENTA";
      operationKind?: "TRANSFER" | "REMITTANCE";
      startDate?: string;
      endDate?: string;
    }) =>
      [
        "transactions",
        "list",
        params?.type ?? "all",
        params?.operationKind ?? "all",
        params?.startDate ?? "none",
        params?.endDate ?? "none",
      ] as const,
    positions: () => ["transactions", "positions"] as const,
    remittances: () => ["transactions", "remittances"] as const,
    currencies: () => ["transactions", "currencies"] as const,
    exchangeRates: () => ["transactions", "exchangeRates"] as const,
  },
  cash: {
    overview: () => ["cash", "overview"] as const,
    balances: () => ["cash", "balances"] as const,
    transactions: () => ["cash", "transactions"] as const,
    audits: (currencyId?: number) =>
      ["cash", "audits", currencyId ?? "all"] as const,
    adjustments: (currencyId?: number) =>
      ["cash", "adjustments", currencyId ?? "all"] as const,
  },
  exchangeRates: {
    currencies: () => ["exchangeRates", "currencies"] as const,
    current: () => ["exchangeRates", "current"] as const,
    all: () => ["exchangeRates", "all"] as const,
    byCurrency: (currencyId: number) =>
      ["exchangeRates", "byCurrency", currencyId] as const,
    history: (currencyId?: number) =>
      ["exchangeRates", "history", currencyId ?? "all"] as const,
    manualRates: () => ["exchangeRates", "manualRates"] as const,
    pairHistory: (fromId: number, toId: number) =>
      ["exchangeRates", "pairHistory", fromId, toId] as const,
    pairStats: (fromId: number, toId: number) =>
      ["exchangeRates", "pairStats", fromId, toId] as const,
    latestRate: (fromId: number, toId: number) =>
      ["exchangeRates", "latestRate", fromId, toId] as const,
  },
  bankAccounts: {
    list: () => ["bankAccounts", "list"] as const,
    detail: (id: number) => ["bankAccounts", "detail", id] as const,
    balance: (id: number) => ["bankAccounts", "balance", id] as const,
    transactions: (id: number) => ["bankAccounts", "transactions", id] as const,
  },
  currencies: {
    list: () => ["currencies", "list"] as const,
    withPrimary: () => ["currencies", "withPrimary"] as const,
    detail: (id: number) => ["currencies", "detail", id] as const,
  },
  plans: {
    list: () => ["plans", "list"] as const,
    detail: (id: number) => ["plans", "detail", id] as const,
    catalog: () => ["plans", "catalog"] as const,
  },
  users: {
    operationalList: () => ["users", "operationalList"] as const,
  },
  subscriptions: {
    list: () => ["subscriptions", "list"] as const,
    userLicenses: (userId?: number) =>
      ["subscriptions", "userLicenses", userId ?? "all"] as const,
    payments: (userId?: number) =>
      ["subscriptions", "payments", userId ?? "all"] as const,
  },
  notifications: {
    list: (page?: number, unreadOnly?: boolean) =>
      ["notifications", "list", page ?? 1, unreadOnly ?? false] as const,
    unreadCount: () => ["notifications", "unreadCount"] as const,
  },
  admin: {
    profileStats: () => ["admin", "profileStats"] as const,
    profileAuditLogs: (limit: number) =>
      ["admin", "profileAuditLogs", limit] as const,
    kpis: (dateFrom?: string, dateTo?: string, planId?: number) =>
      [
        "admin",
        "kpis",
        dateFrom ?? "none",
        dateTo ?? "none",
        planId ?? "all",
      ] as const,
    users: () => ["admin", "users"] as const,
    userDetail: (userId?: number) =>
      ["admin", "userDetail", userId ?? "none"] as const,
    userControlActions: (userId?: number) =>
      ["admin", "userControlActions", userId ?? "none"] as const,
    blockedUsers: () => ["admin", "blockedUsers"] as const,
    expiringLicenses: (windowDays: 7 | 30) =>
      ["admin", "expiringLicenses", windowDays] as const,
    auditLogs: () => ["admin", "auditLogs"] as const,
    platformSeries: (monthsBack: number) =>
      ["admin", "platformSeries", monthsBack] as const,
  },
  expenses: {
    list: () => ["expenses", "list"] as const,
    detail: (id: number) => ["expenses", "detail", id] as const,
  },
  workerPayments: {
    list: () => ["workerPayments", "list"] as const,
    detail: (id: number) => ["workerPayments", "detail", id] as const,
  },
  profile: {
    bankAccounts: () => ["profile", "bankAccounts"] as const,
    activeObjectives: () => ["profile", "activeObjectives"] as const,
    cashBalances: () => ["profile", "cashBalances"] as const,
    dailyReport: () => ["profile", "dailyReport"] as const,
  },
  reports: {
    fxPerformance: (startDate: string, endDate: string, currency?: string) =>
      ["reports", "fxPerformance", startDate, endDate, currency ?? "all"] as const,
    dailyReport: (date: string) => ["reports", "dailyReport", date] as const,
    cashBalances: () => ["reports", "cashBalances"] as const,
    periodReport: (startDate: string, endDate: string) =>
      ["reports", "periodReport", startDate, endDate] as const,
    profitReport: (startDate: string, endDate: string) =>
      ["reports", "profitReport", startDate, endDate] as const,
    currencyReport: (
      currencyId: number,
      startDate?: string,
      endDate?: string,
    ) =>
      [
        "reports",
        "currencyReport",
        currencyId,
        startDate ?? "none",
        endDate ?? "none",
      ] as const,
    expensesReport: (startDate?: string, endDate?: string, category?: string) =>
      [
        "reports",
        "expensesReport",
        startDate ?? "none",
        endDate ?? "none",
        category ?? "all",
      ] as const,
    accountsReport: () => ["reports", "accountsReport"] as const,
    objectivesReport: () => ["reports", "objectivesReport"] as const,
    cashFlowReport: (startDate: string, endDate: string) =>
      ["reports", "cashFlowReport", startDate, endDate] as const,
    auditSummary: (startDate?: string, endDate?: string) =>
      [
        "reports",
        "auditSummary",
        startDate ?? "none",
        endDate ?? "none",
      ] as const,
  },
  objectives: {
    list: (status?: "ACTIVO" | "COMPLETADO" | "PAUSADO") =>
      ["objectives", "list", status ?? "all"] as const,
    detail: (id: number) => ["objectives", "detail", id] as const,
    progress: (id: number) => ["objectives", "progress", id] as const,
  },
};
