import api from "../../../services/api";
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
} from "../../../types";

export const expensesRepository = {
  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    currencyId?: number;
  }): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/expenses", { params });
    return response.data!;
  },

  async getExpenseById(id: number): Promise<Expense> {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data!;
  },

  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    const response = await api.post<Expense>("/expenses", data);
    return response.data!;
  },

  async updateExpense(id: number, data: UpdateExpenseInput): Promise<Expense> {
    const response = await api.patch<Expense>(`/expenses/${id}`, data);
    return response.data!;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getPendingExpenses(): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/expenses/pending");
    return response.data!;
  },
};
