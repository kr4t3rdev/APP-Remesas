import api from "../../../services/api";
import type {
  Reconciliation,
  ReconcileExpenseRequest,
  ReconcileIncomeRequest,
  ReconcileIncomeBulkRequest,
} from "../../../types";

export const reconciliationsRepository = {
  async getAll(): Promise<Reconciliation[]> {
    const response = await api.get<Reconciliation[]>("/reconciliations");
    return response.data;
  },

  async getOne(
    id: number,
    type: "expense" | "income",
  ): Promise<Reconciliation> {
    const response = await api.get<Reconciliation>(`/reconciliations/${id}`, {
      params: { type },
    });
    return response.data;
  },

  async reconcileExpense(data: ReconcileExpenseRequest): Promise<void> {
    await api.post("/reconciliations/expense", data);
  },

  async reconcileIncome(data: ReconcileIncomeRequest): Promise<void> {
    await api.post("/reconciliations/income", data);
  },

  async reconcileIncomeBulk(data: ReconcileIncomeBulkRequest): Promise<void> {
    await api.post("/reconciliations/income/bulk", data);
  },
};
