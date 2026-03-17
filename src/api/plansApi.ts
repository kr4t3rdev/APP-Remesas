import api from '../services/api';
import { Plan } from '../types/plans';

export const plansApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<Plan[]>('/plans');
    return response.data;
  },

  createPlan: async (plan: Omit<Plan, 'id'>): Promise<Plan> => {
    const response = await api.post<Plan>('/plans', plan);
    return response.data;
  },

  updatePlan: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
    const response = await api.put<Plan>(`/plans/${id}`, updates);
    return response.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`/plans/${id}`);
  },
};
