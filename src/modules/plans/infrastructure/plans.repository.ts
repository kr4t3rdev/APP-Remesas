import api from "../../../services/api";
import { toDecimalString, toOptionalDecimalString } from "../../../utils/decimalString";
import type { CreatePlanInput, Plan } from "../../../types";

// The backend exposes plans only under /plans (PlansController).
// Licenses live under /subscriptions/licenses — there is no
// /subscriptions/plans route; calling it returns 404.
export const plansRepository = {
  async getAll(): Promise<Plan[]> {
    const response = await api.get<Plan[]>("/plans");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getOne(id: number): Promise<Plan> {
    const response = await api.get<Plan>(`/plans/${id}`);
    return response.data!;
  },

  async create(data: CreatePlanInput): Promise<Plan> {
    // Decisión 1.14: los precios viajan como decimal-string.
    const response = await api.post<Plan>("/plans", {
      ...data,
      ...(data.monthlyUsd !== undefined
        ? { monthlyUsd: toDecimalString(data.monthlyUsd) }
        : {}),
      ...(data.semiannualUsd !== undefined
        ? { semiannualUsd: toDecimalString(data.semiannualUsd) }
        : {}),
      ...(data.annualUsd !== undefined
        ? { annualUsd: toDecimalString(data.annualUsd) }
        : {}),
    });
    return response.data!;
  },

  async update(id: number, data: Partial<CreatePlanInput>): Promise<Plan> {
    const response = await api.patch<Plan>(`/plans/${id}`, {
      ...data,
      ...(data.monthlyUsd !== undefined
        ? { monthlyUsd: toDecimalString(data.monthlyUsd) }
        : {}),
      ...(data.semiannualUsd !== undefined
        ? { semiannualUsd: toOptionalDecimalString(data.semiannualUsd) }
        : {}),
      ...(data.annualUsd !== undefined
        ? { annualUsd: toOptionalDecimalString(data.annualUsd) }
        : {}),
    });
    return response.data!;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/plans/${id}`);
  },
};
