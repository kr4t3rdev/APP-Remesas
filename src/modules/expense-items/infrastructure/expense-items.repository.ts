import api from '../../../services/api';
import type {
  ExpenseItem,
  CreateExpenseItemInput,
  UpdateExpenseItemInput,
  ExpenseReport,
  ReportPeriod,
} from '../../../types';

export const expenseItemsRepository = {
  async getExpenseItems(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseItem[]> {
    const response = await api.get<ExpenseItem[]>('/expense-items', { params });
    return response.data;
  },

  async getExpenseItemById(id: number): Promise<ExpenseItem> {
    const response = await api.get<ExpenseItem>(`/expense-items/${id}`);
    return response.data;
  },

  async createExpenseItem(data: CreateExpenseItemInput): Promise<ExpenseItem> {
    const response = await api.post<ExpenseItem>('/expense-items', data);
    return response.data;
  },

  async updateExpenseItem(id: number, data: UpdateExpenseItemInput): Promise<ExpenseItem> {
    const response = await api.patch<ExpenseItem>(`/expense-items/${id}`, data);
    return response.data;
  },

  async deleteExpenseItem(id: number): Promise<void> {
    await api.delete(`/expense-items/${id}`);
  },

  async getExpenseReport(period: ReportPeriod, date?: string): Promise<ExpenseReport> {
    const response = await api.get<ExpenseReport>(`/expense-items/reports/${period}`, {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/expense-items/categories');
    return response.data;
  },
};
