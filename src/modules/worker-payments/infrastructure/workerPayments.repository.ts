import api from "../../../services/api";
import type {
  Worker,
  CreateWorkerInput,
  UpdateWorkerInput,
  CreateTransactionInput,
  AddBalanceInput,
} from "../../../types";

export const workerPaymentsRepository = {
  async getWorkers(): Promise<Worker[]> {
    const response = await api.get<Worker[]>("/worker-payments");
    return response.data!;
  },

  async getWorkerById(id: number): Promise<Worker> {
    const response = await api.get<Worker>(`/worker-payments/${id}`);
    return response.data!;
  },

  async createWorker(input: CreateWorkerInput): Promise<Worker> {
    const response = await api.post<Worker>("/worker-payments", input);
    return response.data!;
  },

  async updateWorker(id: number, input: UpdateWorkerInput): Promise<Worker> {
    const response = await api.put<Worker>(`/worker-payments/${id}`, input);
    return response.data!;
  },

  async deleteWorker(id: number): Promise<void> {
    await api.delete(`/worker-payments/${id}`);
  },

  async createTransaction(
    workerId: number,
    input: Omit<CreateTransactionInput, "workerId">,
  ): Promise<Worker> {
    const response = await api.post<{ worker: Worker }>(
      `/worker-payments/${workerId}/transaction`,
      input,
    );
    return response.data!.worker;
  },

  async addBalance(workerId: number, amount: number): Promise<Worker> {
    const response = await api.post<{ worker: Worker }>(
      `/worker-payments/${workerId}/balance`,
      { amount },
    );
    return response.data!.worker;
  },
};
