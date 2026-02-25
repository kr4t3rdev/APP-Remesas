export const queryKeys = {
  dashboard: {
    dailyReport: (date?: string) => ['dashboard', 'dailyReport', date ?? 'today'] as const,
    cashBalances: () => ['dashboard', 'cashBalances'] as const,
    exchangeRates: () => ['dashboard', 'exchangeRates'] as const,
    recentTransactions: (limit?: number) => ['dashboard', 'recentTransactions', limit ?? 'all'] as const,
    pendingTransactions: () => ['dashboard', 'pendingTransactions'] as const,
    activeObjectives: () => ['dashboard', 'activeObjectives'] as const,
    recentExpenses: (limit?: number) => ['dashboard', 'recentExpenses', limit ?? 'all'] as const,
  },
  transactions: {
    list: (type?: 'COMPRA' | 'VENTA') => ['transactions', 'list', type ?? 'all'] as const,
    currencies: () => ['transactions', 'currencies'] as const,
    exchangeRates: () => ['transactions', 'exchangeRates'] as const,
  },
  cash: {
    balances: () => ['cash', 'balances'] as const,
    transactions: () => ['cash', 'transactions'] as const,
    audits: (currencyId?: number) => ['cash', 'audits', currencyId ?? 'all'] as const,
    adjustments: (currencyId?: number) => ['cash', 'adjustments', currencyId ?? 'all'] as const,
  },
  exchangeRates: {
    currencies: () => ['exchangeRates', 'currencies'] as const,
    current: () => ['exchangeRates', 'current'] as const,
    history: (currencyId?: number) => ['exchangeRates', 'history', currencyId ?? 'all'] as const,
  },
  expenses: {
    list: () => ['expenses', 'list'] as const,
  },
  profile: {
    bankAccounts: () => ['profile', 'bankAccounts'] as const,
    activeObjectives: () => ['profile', 'activeObjectives'] as const,
    cashBalances: () => ['profile', 'cashBalances'] as const,
    dailyReport: () => ['profile', 'dailyReport'] as const,
  },
  reports: {
    dailyReport: (date: string) => ['reports', 'dailyReport', date] as const,
    cashBalances: () => ['reports', 'cashBalances'] as const,
  },
  objectives: {
    list: (status?: 'ACTIVO' | 'COMPLETADO' | 'PAUSADO') =>
      ['objectives', 'list', status ?? 'all'] as const,
  },
};
