import api from "../../../services/api";
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
    const response = await api.get<DailyReport>("/reports/daily", {
      params: { date },
    });
    return response.data;
  },

  async getCashBalances(): Promise<CashBalance[]> {
    const response = await api.get<CashBalance[]>("/cash-balances");
    return response.data;
  },

  async getExchangeRates(): Promise<ExchangeRate[]> {
    const response = await api.get<ExchangeRatesResponse>("/exchange-rates");
    return response.data.rates ?? [];
  },

  async getTransactions(params?: {
    type?: string;
    currencyId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>("/transactions", { params });
    return response.data;
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>("/transactions/pending");
    return response.data;
  },

  async getObjectives(status?: string): Promise<Objective[]> {
    const response = await api.get<Objective[]>("/objectives", {
      params: { status },
    });
    return response.data;
  },

  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    currencyId?: number;
  }): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/expenses", { params });
    return response.data;
  },
};
