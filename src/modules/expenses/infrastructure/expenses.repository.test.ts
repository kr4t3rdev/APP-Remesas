import api from "../../../services/api";
import { expensesRepository } from "./expenses.repository";

jest.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("expensesRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests expenses list with params and returns paginated response", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { items: [{ id: 1 }], total: 1, page: 1, pageSize: 50 }, status: 200, statusText: 'OK', headers: new Headers() } as never);

    const params = { category: "otros", startDate: "2026-03-01" };
    const result = await expensesRepository.getExpenses(params);

    expect(mockedApi.get).toHaveBeenCalledWith("/expenses", { params });
    expect(result).toEqual({ items: [{ id: 1 }], total: 1, page: 1, pageSize: 50 });
  });

  it("requests expense detail by id", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: 7 }, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await expensesRepository.getExpenseById(7);

    expect(mockedApi.get).toHaveBeenCalledWith("/expenses/7");
    expect(result).toEqual({ id: 7 });
  });

  it("creates an expense", async () => {
    const payload = {
      description: "Internet",
      amount: 50,
      currencyId: 1,
      sourceType: "CASH" as const,
      category: "servicios" as const,
      date: "2026-03-06",
    };
    mockedApi.post.mockResolvedValueOnce({ data: { id: 9, ...payload }, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await expensesRepository.createExpense(payload);

    expect(mockedApi.post).toHaveBeenCalledWith("/expenses", {
      ...payload,
      amount: "50",
    });
    expect(result).toEqual({ id: 9, ...payload });
  });

  it("updates an expense", async () => {
    const payload = { notes: "Actualizado" };
    mockedApi.patch.mockResolvedValueOnce({ data: { id: 3, ...payload }, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await expensesRepository.updateExpense(3, payload);

    expect(mockedApi.patch).toHaveBeenCalledWith("/expenses/3", payload);
    expect(result).toEqual({ id: 3, ...payload });
  });

  it("deletes an expense", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: undefined, status: 200, statusText: 'OK', headers: new Headers() });

    await expensesRepository.deleteExpense(4);

    expect(mockedApi.delete).toHaveBeenCalledWith("/expenses/4");
  });

  describe("error handling", () => {
    const backendError = {
      response: { data: { message: "Saldo insuficiente en caja" }, status: 400, statusText: "Bad Request", headers: new Headers() },
      status: 400,
      statusText: "Bad Request",
    };

    it("logs and rethrows getExpenses failures", async () => {
      mockedApi.get.mockRejectedValueOnce(backendError);
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      await expect(expensesRepository.getExpenses()).rejects.toEqual(backendError);
      expect(warnSpy).toHaveBeenCalledWith(
        "[Expenses] getExpenses falló",
        expect.objectContaining({
          backendMessage: backendError.response.data,
          status: 400,
          statusText: "Bad Request",
        }),
      );

      warnSpy.mockRestore();
    });

    it("logs and rethrows createExpense failures", async () => {
      mockedApi.post.mockRejectedValueOnce(backendError);
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      await expect(
        expensesRepository.createExpense({
          description: "Internet",
          amount: 50,
          currencyId: 1,
          sourceType: "CASH",
          category: "servicios",
          date: "2026-03-06",
        }),
      ).rejects.toEqual(backendError);
      expect(warnSpy).toHaveBeenCalledWith(
        "[Expenses] createExpense falló",
        expect.objectContaining({ backendMessage: backendError.response.data }),
      );

      warnSpy.mockRestore();
    });

    it("logs and rethrows updateExpense failures", async () => {
      mockedApi.patch.mockRejectedValueOnce(backendError);
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      await expect(
        expensesRepository.updateExpense(3, { notes: "x" }),
      ).rejects.toEqual(backendError);
      expect(warnSpy).toHaveBeenCalledWith(
        "[Expenses] updateExpense falló",
        expect.objectContaining({ backendMessage: backendError.response.data }),
      );

      warnSpy.mockRestore();
    });

    it("logs and rethrows deleteExpense failures", async () => {
      mockedApi.delete.mockRejectedValueOnce(backendError);
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      await expect(expensesRepository.deleteExpense(4)).rejects.toEqual(backendError);
      expect(warnSpy).toHaveBeenCalledWith(
        "[Expenses] deleteExpense falló",
        expect.objectContaining({ backendMessage: backendError.response.data }),
      );

      warnSpy.mockRestore();
    });
  });

});
