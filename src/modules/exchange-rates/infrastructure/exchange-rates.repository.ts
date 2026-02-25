import api from '../../../services/api';
import type { Currency, ExchangeRate, RateHistory } from '../../../types';

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

  async getRateHistory(currencyId?: number): Promise<RateHistory[]> {
    const response = await api.get<RateHistory[]>('/rate-history', {
      params: { currencyId },
    });
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
