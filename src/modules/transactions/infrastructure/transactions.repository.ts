import api from "../../../services/api";
import type {
  Currency,
  ExchangeRate,
  Transaction,
  TransactionType,
} from "../../../types";

type ExchangeRatesResponse = {
  rates: ExchangeRate[];
};

export const transactionsRepository = {
  async getTransactions(params?: {
    type?: TransactionType;
    status?: "PENDIENTE" | "RECONCILIADO";
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>("/transactions", { params });
    return response.data!;
  },

  async createTransaction(data: {
    type: TransactionType;
    currencyId: number;
    amount: number;
    rate: number;
    notes?: string;
  }): Promise<Transaction> {
    const response = await api.post<Transaction>("/transactions", data);
    return response.data!;
  },

  async getCurrencies(): Promise<Currency[]> {
    const response = await api.get<Currency[]>("/currencies");
    return response.data!;
  },

  async getExchangeRates(): Promise<ExchangeRate[]> {
    const response = await api.get<ExchangeRatesResponse>("/exchange-rates");
    return response.data!.rates ?? [];
  },
};
