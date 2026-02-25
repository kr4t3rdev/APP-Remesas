import api from '../../../services/api';
import type { Objective, ObjectiveStatus } from '../../../types';

export const objectivesRepository = {
  async getObjectives(status?: ObjectiveStatus): Promise<Objective[]> {
    const params = status ? { status } : undefined;
    const response = await api.get<Objective[]>('/objectives', { params });
    return response.data;
  },
};
