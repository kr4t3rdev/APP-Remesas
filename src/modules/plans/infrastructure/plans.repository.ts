import api from "../../../services/api";
import type { CreatePlanInput, Plan } from "../../../types";

export const plansRepository = {
  async getAll(): Promise<Plan[]> {
    try {
      const response = await api.get<Plan[]>("/subscriptions/plans");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      const response = await api.get<Plan[]>("/plans");
      return Array.isArray(response.data) ? response.data : [];
    }
  },

  async getOne(id: number): Promise<Plan> {
    try {
      const response = await api.get<Plan>(`/subscriptions/plans/${id}`);
      return response.data;
    } catch {
      const response = await api.get<Plan>(`/plans/${id}`);
      return response.data;
    }
  },

  async create(data: CreatePlanInput): Promise<Plan> {
    try {
      const response = await api.post<Plan>("/subscriptions/plans", data);
      return response.data;
    } catch {
      const response = await api.post<Plan>("/plans", data);
      return response.data;
    }
  },

  async update(id: number, data: Partial<CreatePlanInput>): Promise<Plan> {
    try {
      const response = await api.patch<Plan>(
        `/subscriptions/plans/${id}`,
        data,
      );
      return response.data;
    } catch {
      const response = await api.patch<Plan>(`/plans/${id}`, data);
      return response.data;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/plans/${id}`);
    } catch {
      await api.delete(`/plans/${id}`);
    }
  },
};
