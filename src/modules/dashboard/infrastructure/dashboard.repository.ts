import api from "../../../services/api";
import { safeData, safeArray, safePath } from "../../../services/api-response";
import type {
  CashBalance,
  DailyReport,
  ExchangeRate,
  Objective,
  Expense,
  Transaction,
} from "../../../types";

type ExchangeRatesResponse = {
  rates: ExchangeRate[];
};

export const dashboardRepository = {
  async getDailyReport(date?: string): Promise<DailyReport> {
    try {
      const response = await api.get<DailyReport>("/reports/daily", {
        params: { date },
      });
      return safeData(response.data, {} as DailyReport)!;
    } catch (error) {
      console.error("[dashboardRepository] Error fetching daily report:", error);
      return {} as DailyReport;
    }
  },

  async getCashBalances(): Promise<CashBalance[]> {
    try {
      const response = await api.get<CashBalance[]>("/cash-balances");
      return safeArray(response.data);
    } catch (error) {
      console.error("[dashboardRepository] Error fetching cash balances:", error);
      return [];
    }
  },

  async getExchangeRates(): Promise<ExchangeRate[]> {
    try {
      const response = await api.get<ExchangeRatesResponse>("/exchange-rates");
      return safePath(response.data, "rates") ?? [];
    } catch (error) {
      console.error("[dashboardRepository] Error fetching exchange rates:", error);
      return [];
    }
  },

  async getTransactions(params?: {
    type?: string;
    currencyId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>("/transactions", { params });
      return safeArray(response.data);
    } catch (error) {
      console.error("[dashboardRepository] Error fetching transactions:", error);
      return [];
    }
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>("/transactions/pending");
      return safeArray(response.data);
    } catch (error) {
      console.error("[dashboardRepository] Error fetching pending transactions:", error);
      return [];
    }
  },

  async getObjectives(status?: string): Promise<Objective[]> {
    try {
      const response = await api.get<Objective[]>("/objectives", {
        params: { status },
      });
      return safeArray(response.data);
    } catch (error) {
      console.error("[dashboardRepository] Error fetching objectives:", error);
      return [];
    }
  },

  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    currencyId?: number;
  }): Promise<Expense[]> {
    try {
      const response = await api.get<Expense[]>("/expenses", { params });
      return safeArray(response.data);
    } catch (error) {
      console.error("[dashboardRepository] Error fetching expenses:", error);
      return [];
    }
  },
};
