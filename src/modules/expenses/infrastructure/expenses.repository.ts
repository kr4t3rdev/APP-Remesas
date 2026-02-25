import api from '../../../services/api';
import type { Expense } from '../../../types';

export const expensesRepository = {
  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    currencyId?: number;
  }): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/expenses', { params });
    return response.data;
  },
};
