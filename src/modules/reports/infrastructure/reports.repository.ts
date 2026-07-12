import api from "../../../services/api";
import type {
  CashBalance,
  DailyReport,
  PeriodReport,
  ProfitReport,
  CurrencyReport,
  ExpensesReport,
  AccountsReport,
  ObjectivesReport,
  CashFlowReport,
  AuditSummaryReport,
} from "../../../types";

export const reportsRepository = {
  async getDailyReport(date: string): Promise<DailyReport> {
    const response = await api.get<DailyReport>("/reports/daily", {
      params: { date },
    });
    return response.data!;
  },

  async getCashBalances(): Promise<CashBalance[]> {
    const response = await api.get<CashBalance[]>("/cash-balances");
    return response.data!;
  },

  async getPeriodReport(
    startDate: string,
    endDate: string,
  ): Promise<PeriodReport> {
    const response = await api.get<PeriodReport>("/reports/period", {
      params: { startDate, endDate },
    });
    return response.data!;
  },

  async getProfitReport(
    startDate: string,
    endDate: string,
  ): Promise<ProfitReport> {
    const response = await api.get<ProfitReport>("/reports/profit", {
      params: { startDate, endDate },
    });
    return response.data!;
  },

  async getCurrencyReport(
    currencyId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CurrencyReport> {
    const response = await api.get<CurrencyReport>(
      `/reports/currency/${currencyId}`,
      {
        params: { startDate, endDate },
      },
    );
    return response.data!;
  },

  async getExpensesReport(
    startDate?: string,
    endDate?: string,
    category?: string,
  ): Promise<ExpensesReport> {
    const response = await api.get<ExpensesReport>("/reports/expenses", {
      params: { startDate, endDate, category },
    });
    return response.data!;
  },

  async getAccountsReport(): Promise<AccountsReport> {
    const response = await api.get<AccountsReport>("/reports/accounts");
    return response.data!;
  },

  async getObjectivesReport(): Promise<ObjectivesReport> {
    const response = await api.get<ObjectivesReport>("/reports/objectives");
    return response.data!;
  },

  async getCashFlowReport(
    startDate: string,
    endDate: string,
  ): Promise<CashFlowReport> {
    const response = await api.get<CashFlowReport>("/reports/cash-flow", {
      params: { startDate, endDate },
    });
    return response.data!;
  },

  async getAuditSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<AuditSummaryReport> {
    const response = await api.get<AuditSummaryReport>(
      "/reports/audit-summary",
      {
        params: { startDate, endDate },
      },
    );
    return response.data!;
  },
};
