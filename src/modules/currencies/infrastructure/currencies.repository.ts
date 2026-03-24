import api from "../../../services/api";
import type {
  Currency,
  CurrenciesWithPrimary,
  CurrencyDetail,
} from "../../../types";

export const currenciesRepository = {
  async getAll(): Promise<Currency[]> {
    const response = await api.get<Currency[]>("/currencies");
    return response.data;
  },

  async getWithPrimary(): Promise<CurrenciesWithPrimary> {
    const response = await api.get<CurrenciesWithPrimary>(
      "/currencies/with-primary",
    );
    return response.data;
  },

  async getById(id: number): Promise<CurrencyDetail> {
    const response = await api.get<CurrencyDetail>(`/currencies/${id}`);
    return response.data;
  },

  async create(data: {
    code: string;
    name: string;
    symbol: string;
    isActive?: boolean;
  }): Promise<Currency> {
    const response = await api.post<Currency>("/currencies", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<{
      code: string;
      name: string;
      symbol: string;
      isActive: boolean;
    }>,
  ): Promise<Currency> {
    const response = await api.patch<Currency>(`/currencies/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/currencies/${id}`);
  },

  async setPrimaryCurrency(
    primaryCurrencyId: number,
  ): Promise<{ id: number; primaryCurrencyId: number }> {
    const response = await api.patch<{ id: number; primaryCurrencyId: number }>(
      "/auth/me/primary-currency",
      {
        primaryCurrencyId,
      },
    );
    return response.data;
  },
};
