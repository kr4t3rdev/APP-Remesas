import api from './api';
import type { Currency, ExchangeRate, Transaction, CashBalance, DailyReport } from '../types';

export const currencyService = {
  getAll: async (): Promise<Currency[]> => {
    const response = await api.get<Currency[]>('/currencies');
    return response.data;
  },
};

export const exchangeRateService = {
  getCurrent: async (): Promise<ExchangeRate[]> => {
    const response = await api.get<ExchangeRate[]>('/exchange-rates');
    return response.data;
  },

  update: async (currencyId: number, data: {
    referenceRate: number;
    buyMargin: number;
    sellMargin: number;
  }): Promise<ExchangeRate> => {
    const response = await api.put<ExchangeRate>(`/exchange-rates/${currencyId}`, data);
    return response.data;
  },
};

export const transactionService = {
  getAll: async (params?: {
    type?: string;
    currencyId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  getPending: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions/pending');
    return response.data;
  },

  create: async (data: {
    type: string;
    currencyId: number;
    amount: number;
    rate: number;
    notes?: string;
  }): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },
};

export const cashBalanceService = {
  getAll: async (): Promise<CashBalance[]> => {
    const response = await api.get<CashBalance[]>('/cash-balances');
    return response.data;
  },
};

export const reportService = {
  getDaily: async (date?: string): Promise<DailyReport> => {
    const response = await api.get<DailyReport>('/reports/daily', {
      params: { date },
    });
    return response.data;
  },

  getPeriod: async (startDate: string, endDate: string) => {
    const response = await api.get('/reports/period', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
