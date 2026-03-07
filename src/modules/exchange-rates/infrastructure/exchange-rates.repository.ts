import api from '../../../services/api';
import type { Currency, ExchangeRate, RateHistory, RateHistoryEntry, RateStats, CreateRateHistoryInput } from '../../../types';

type ExchangeRatesResponse = {
  rates: ExchangeRate[];
};

export const exchangeRatesRepository = {
  async getCurrencies(): Promise<Currency[]> {
    const response = await api.get<Currency[]>('/currencies');
    return response.data;
  },

  async getExchangeRates(): Promise<ExchangeRate[]> {
    const response = await api.get<ExchangeRatesResponse>('/exchange-rates');
    return response.data.rates ?? [];
  },

  async getAllRates(): Promise<ExchangeRate[]> {
    const response = await api.get<ExchangeRate[]>('/exchange-rates/all');
    return response.data;
  },

  async getRatesByCurrency(currencyId: number): Promise<ExchangeRate> {
    const response = await api.get<ExchangeRate>(`/exchange-rates/${currencyId}`);
    return response.data;
  },

  async getRateHistory(currencyId?: number): Promise<RateHistory[]> {
    const response = await api.get<RateHistory[]>('/rate-history', {
      params: { currencyId },
    });
    return response.data;
  },

  async getManualRates(): Promise<RateHistoryEntry[]> {
    const response = await api.get<RateHistoryEntry[]>('/rate-history/manual');
    return response.data;
  },

  async getPairHistory(fromId: number, toId: number): Promise<RateHistoryEntry[]> {
    const response = await api.get<RateHistoryEntry[]>(`/rate-history/pair/${fromId}/${toId}`);
    return response.data;
  },

  async getPairStats(fromId: number, toId: number): Promise<RateStats> {
    const response = await api.get<RateStats>(`/rate-history/stats/${fromId}/${toId}`);
    return response.data;
  },

  async getLatestRate(fromId: number, toId: number): Promise<RateHistoryEntry> {
    const response = await api.get<RateHistoryEntry>(`/rate-history/latest/${fromId}/${toId}`);
    return response.data;
  },

  async createRateHistory(data: CreateRateHistoryInput): Promise<RateHistoryEntry> {
    const response = await api.post<RateHistoryEntry>('/rate-history', data);
    return response.data;
  },

  async updateExchangeRate(
    currencyId: number,
    data: { referenceRate: number; buyMargin: number; sellMargin: number }
  ): Promise<ExchangeRate> {
    const response = await api.put<ExchangeRate>(`/exchange-rates/${currencyId}`, data);
    return response.data;
  },
};
