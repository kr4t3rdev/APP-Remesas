import api from "../../../services/api";
import type {
  Expense,
  ExpenseListResponse,
  CreateExpenseInput,
  UpdateExpenseInput,
} from "../../../types";

const logError = (method: string, extra: Record<string, unknown>, error: unknown) => {
  if (__DEV__) {
    console.warn(`[Expenses] ${method} falló`, {
      ...extra,
      status: (error as { status?: number })?.status,
      statusText: (error as { statusText?: string })?.statusText,
      backendMessage:
        (error as { response?: { data?: unknown } })?.response?.data ??
        (error as { message?: string })?.message,
    });
  }
};

export const expensesRepository = {
  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    currencyId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<ExpenseListResponse> {
    try {
      const response = await api.get<ExpenseListResponse>("/expenses", { params });
      return response.data!;
    } catch (error) {
      logError("getExpenses", { params }, error);
      throw error;
    }
  },

  async getExpenseById(id: number): Promise<Expense> {
    try {
      const response = await api.get<Expense>(`/expenses/${id}`);
      return response.data!;
    } catch (error) {
      logError("getExpenseById", { id }, error);
      throw error;
    }
  },

  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    try {
      const response = await api.post<Expense>("/expenses", data);
      return response.data!;
    } catch (error) {
      logError("createExpense", { payload: data }, error);
      throw error;
    }
  },

  async updateExpense(id: number, data: UpdateExpenseInput): Promise<Expense> {
    try {
      const response = await api.patch<Expense>(`/expenses/${id}`, data);
      return response.data!;
    } catch (error) {
      logError("updateExpense", { id, payload: data }, error);
      throw error;
    }
  },

  async deleteExpense(id: number): Promise<void> {
    try {
      await api.delete(`/expenses/${id}`);
    } catch (error) {
      logError("deleteExpense", { id }, error);
      throw error;
    }
  },

};
