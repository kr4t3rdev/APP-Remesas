import api from "../../../services/api";
import type {
  BankAccount,
  CashBalance,
  DailyReport,
  Objective,
} from "../../../types";

export const profileRepository = {
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await api.get<BankAccount[]>("/bank-accounts");
    return response.data!;
  },

  async getActiveObjectives(): Promise<Objective[]> {
    const response = await api.get<Objective[]>("/objectives", {
      params: { status: "ACTIVO" },
    });
    return response.data!;
  },

  async getCashBalances(): Promise<CashBalance[]> {
    const response = await api.get<CashBalance[]>("/cash-balances");
    return response.data!;
  },

  async getDailyReport(): Promise<DailyReport> {
    const response = await api.get<DailyReport>("/reports/daily");
    return response.data!;
  },
};
