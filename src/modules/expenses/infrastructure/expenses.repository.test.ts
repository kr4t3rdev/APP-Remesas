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

  it("requests expenses list with params", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 1 }] as never[], status: 200, statusText: 'OK', headers: new Headers() });

    const params = { category: "otros", startDate: "2026-03-01" };
    const result = await expensesRepository.getExpenses(params);

    expect(mockedApi.get).toHaveBeenCalledWith("/expenses", { params });
    expect(result).toEqual([{ id: 1 }]);
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

    expect(mockedApi.post).toHaveBeenCalledWith("/expenses", payload);
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

});
