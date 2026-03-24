import api from "../../../services/api";
import type { AdminOperativeUser } from "../../../types";

export const usersRepository = {
  async getOperationalList(): Promise<AdminOperativeUser[]> {
    const response = await api.get<AdminOperativeUser[]>("/admin/users");
    return Array.isArray(response.data) ? response.data : [];
  },
};
