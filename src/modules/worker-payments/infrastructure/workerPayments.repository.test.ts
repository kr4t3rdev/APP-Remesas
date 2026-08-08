import api from "../../../services/api";
import { workerPaymentsRepository } from "./workerPayments.repository";

jest.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("workerPaymentsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWorkers", () => {
    it("requests workers list", async () => {
      const mockWorkers = [{ id: 1, name: "Juan" }] as never;
      mockedApi.get.mockResolvedValueOnce({ data: mockWorkers, status: 200, statusText: 'OK', headers: new Headers() });

      const result = await workerPaymentsRepository.getWorkers();

      expect(mockedApi.get).toHaveBeenCalledWith("/worker-payments");
      expect(result).toEqual(mockWorkers);
    });
  });

  describe("getWorkerById", () => {
    it("requests worker detail by id", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { id: 1, name: "Juan" }, status: 200, statusText: 'OK', headers: new Headers() });

      const result = await workerPaymentsRepository.getWorkerById(1);

      expect(mockedApi.get).toHaveBeenCalledWith("/worker-payments/1");
      expect(result).toEqual({ id: 1, name: "Juan" });
    });
  });

  describe("createWorker", () => {
    it("creates a worker", async () => {
      const payload = { name: "Nuevo Trabajador", phone: "1234567890" };
      mockedApi.post.mockResolvedValueOnce({ data: { id: 1, ...payload }, status: 200, statusText: 'OK', headers: new Headers() });

      const result = await workerPaymentsRepository.createWorker(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/worker-payments", payload);
      expect(result).toEqual({ id: 1, ...payload });
    });
  });

  describe("updateWorker", () => {
    it("updates a worker", async () => {
      const payload = { name: "Trabajador Actualizado" };
      mockedApi.put.mockResolvedValueOnce({ data: { id: 1, ...payload }, status: 200, statusText: 'OK', headers: new Headers() });

      const result = await workerPaymentsRepository.updateWorker(1, payload);

      expect(mockedApi.put).toHaveBeenCalledWith("/worker-payments/1", payload);
      expect(result).toEqual({ id: 1, ...payload });
    });
  });

  describe("deleteWorker", () => {
    it("deletes a worker", async () => {
      mockedApi.delete.mockResolvedValueOnce({ data: undefined, status: 200, statusText: 'OK', headers: new Headers() });

      await workerPaymentsRepository.deleteWorker(1);

      expect(mockedApi.delete).toHaveBeenCalledWith("/worker-payments/1");
    });
  });

  describe("addBalance", () => {
    it("adds balance to a worker", async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: { worker: { id: 1, balance: 1300 } },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      });

      const result = await workerPaymentsRepository.addBalance(1, { amount: 300 });

      expect(mockedApi.post).toHaveBeenCalledWith(
        "/worker-payments/1/balance",
        { amount: 300 },
      );
      expect(result).toEqual({ id: 1, balance: 1300 });
    });
  });
});
