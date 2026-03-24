import api from "../../../services/api";
import type {
  Objective,
  ObjectiveStatus,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  ObjectiveProgress,
} from "../../../types";

export const objectivesRepository = {
  async getObjectives(status?: ObjectiveStatus): Promise<Objective[]> {
    const params = status ? { status } : undefined;
    const response = await api.get<Objective[]>("/objectives", { params });
    return response.data;
  },

  async getObjectiveById(id: number): Promise<Objective> {
    const response = await api.get<Objective>(`/objectives/${id}`);
    return response.data;
  },

  async getObjectiveProgress(id: number): Promise<ObjectiveProgress> {
    const response = await api.get<ObjectiveProgress>(
      `/objectives/${id}/progress`,
    );
    return response.data;
  },

  async createObjective(data: CreateObjectiveInput): Promise<Objective> {
    const response = await api.post<Objective>("/objectives", data);
    return response.data;
  },

  async updateObjective(
    id: number,
    data: UpdateObjectiveInput,
  ): Promise<Objective> {
    const response = await api.patch<Objective>(`/objectives/${id}`, data);
    return response.data;
  },

  async updateObjectiveStatus(
    id: number,
    status: ObjectiveStatus,
  ): Promise<Objective> {
    const response = await api.patch<Objective>(`/objectives/${id}/status`, {
      status,
    });
    return response.data;
  },

  async deleteObjective(id: number): Promise<void> {
    await api.delete(`/objectives/${id}`);
  },
};
