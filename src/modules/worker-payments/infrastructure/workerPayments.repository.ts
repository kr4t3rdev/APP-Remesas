import api from "../../../services/api";
import type {
  Worker,
  CreateWorkerInput,
  UpdateWorkerInput,
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

  async addBalance(
    workerId: number,
    payload: {
      amount: number;
      sourceType?: "CASH" | "BANK_ACCOUNT";
      sourceId?: number;
      currencyId?: number;
    },
  ): Promise<Worker> {
    try {
      const response = await api.post<{ worker?: Worker; workerBalance?: Worker }>(
        `/worker-payments/${workerId}/balance`,
        payload,
      );
      return response.data!.worker ?? response.data!.workerBalance!;
    } catch (error: any) {
      if (__DEV__) {
        console.warn("[WorkerPayments] addBalance falló", {
          url: `/worker-payments/${workerId}/balance`,
          payload,
          status: error?.status,
          statusText: error?.statusText,
          backendMessage: error?.response?.data ?? error?.message,
        });
      }
      throw error;
    }
  },

  async deposit(
    workerId: number,
    payload: {
      amount: number;
      destinationType?: "CASH" | "BANK_ACCOUNT";
      destinationId?: number;
      currencyId?: number;
    },
  ): Promise<Worker> {
    try {
      const response = await api.post<{ worker?: Worker; workerBalance?: Worker }>(
        `/worker-payments/${workerId}/deposit`,
        payload,
      );
      return response.data!.worker ?? response.data!.workerBalance!;
    } catch (error: any) {
      if (__DEV__) {
        console.warn("[WorkerPayments] deposit falló", {
          url: `/worker-payments/${workerId}/deposit`,
          payload,
          status: error?.status,
          statusText: error?.statusText,
          backendMessage: error?.response?.data ?? error?.message,
        });
      }
      throw error;
    }
  },
};
