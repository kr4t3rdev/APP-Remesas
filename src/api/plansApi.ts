import api from '../services/api';
import { Plan as FrontendPlan } from '../types/plans';
import { plansRepository } from '../modules/plans/infrastructure/plans.repository';

// Re-using the actual backend types to avoid duplicated implementation
// since we found plans.repository.ts which seems to be the real implementation.

const mapRepositoryPlanToFrontend = (plan: any): FrontendPlan => {
  return {
    id: plan.id.toString(),
    name: plan.name,
    price: plan.monthlyUsd || plan.price || 0, // Fallback to monthlyUsd or price if price doesn't exist
    description: plan.description || '',
    benefits: [], // Backend Plan type doesn't have features array by default
    tags: [],
    icon: 'star',
    isActive: plan.isActive ?? true,
    isPopular: false,
    themeColor: '#3b82f6',
  };
};

export const plansApi = {
  getPlans: async (): Promise<FrontendPlan[]> => {
    try {
      const data = await plansRepository.getAll();
      return data.map(mapRepositoryPlanToFrontend);
    } catch (e) {
      console.error("Error in plansApi.getPlans:", e);
      throw e;
    }
  },

  createPlan: async (plan: Omit<FrontendPlan, 'id'>): Promise<FrontendPlan> => {
    const payload = {
      name: plan.name,
      monthlyUsd: plan.price,
      description: plan.description,
      isActive: plan.isActive,
    };
    
    try {
      const data = await plansRepository.create(payload as any);
      return mapRepositoryPlanToFrontend(data);
    } catch (e) {
      console.error("Error in plansApi.createPlan:", e);
      throw e;
    }
  },

  updatePlan: async (id: string, updates: Partial<FrontendPlan>): Promise<FrontendPlan> => {
    const payload: Partial<any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.monthlyUsd = updates.price;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    try {
      const data = await plansRepository.update(Number(id), payload);
      return mapRepositoryPlanToFrontend(data);
    } catch (e) {
      console.error("Error in plansApi.updatePlan:", e);
      throw e;
    }
  },

  deletePlan: async (id: string): Promise<void> => {
    try {
      await plansRepository.delete(Number(id));
    } catch (e) {
      console.error("Error in plansApi.deletePlan:", e);
      throw e;
    }
  },
};
