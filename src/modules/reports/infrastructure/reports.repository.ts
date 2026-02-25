import api from '../../../services/api';
import type { CashBalance, DailyReport } from '../../../types';

export const reportsRepository = {
  async getDailyReport(date: string): Promise<DailyReport> {
    const response = await api.get<DailyReport>('/reports/daily', {
      params: { date },
    });
    return response.data;
  },

  async getCashBalances(): Promise<CashBalance[]> {
    const response = await api.get<CashBalance[]>('/cash-balances');
    return response.data;
  },
};
