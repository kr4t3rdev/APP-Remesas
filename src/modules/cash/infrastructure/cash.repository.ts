import api from "../../../services/api";
import type {
  CashAdjustment,
  CashAdjustmentType,
  CashAudit,
  CashBalance,
  CashOverview,
  Transaction,
} from "../../../types";

export const cashRepository = {
  async getOverview(): Promise<CashOverview> {
    const response = await api.get<CashOverview>("/cash/overview");
    return response.data!;
  },

  async getCashBalances(): Promise<CashBalance[]> {
    const response = await api.get<CashBalance[]>("/cash-balances");
    return response.data!;
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>("/transactions");
    return response.data!;
  },

  async getCashAudits(currencyId?: number): Promise<CashAudit[]> {
    const response = await api.get<CashAudit[]>("/cash-audits", {
      params: { currencyId },
    });
    return response.data!;
  },

  async getCashAdjustments(currencyId?: number): Promise<CashAdjustment[]> {
    const response = await api.get<CashAdjustment[]>("/cash-adjustments", {
      params: { currencyId },
    });
    return response.data!;
  },

  async createCashAudit(data: {
    currencyId: number;
    actualBalance: number;
    notes?: string;
  }): Promise<void> {
    await api.post("/cash-audits", data);
  },

  async createCashAdjustment(data: {
    currencyId: number;
    amount: number;
    type: CashAdjustmentType;
    reason: string;
  }): Promise<CashAdjustment> {
    const response = await api.post<CashAdjustment>("/cash-adjustments", data);
    return response.data!;
  },
};
