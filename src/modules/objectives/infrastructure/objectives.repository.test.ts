import api from "../../../services/api";
import { objectivesRepository } from "./objectives.repository";

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

describe("objectivesRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests objectives list with status filter", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 1 }] as never[], status: 200, statusText: 'OK', headers: new Headers() });

    const result = await objectivesRepository.getObjectives("ACTIVO");

    expect(mockedApi.get).toHaveBeenCalledWith("/objectives", {
      params: { status: "ACTIVO" },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("requests objective detail by id", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: 7 }, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await objectivesRepository.getObjectiveById(7);

    expect(mockedApi.get).toHaveBeenCalledWith("/objectives/7");
    expect(result).toEqual({ id: 7 });
  });

  it("requests objective progress", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { objectiveId: 3, percentage: 45 },
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
    });

    const result = await objectivesRepository.getObjectiveProgress(3);

    expect(mockedApi.get).toHaveBeenCalledWith("/objectives/3/progress");
    expect(result).toEqual({ objectiveId: 3, percentage: 45 });
  });

  it("creates an objective", async () => {
    const payload = {
      name: "Ahorrar para laptop",
      targetAmount: 1000,
      currencyId: 1,
    };
    mockedApi.post.mockResolvedValueOnce({ data: { id: 9, ...payload }, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await objectivesRepository.createObjective(payload);

    expect(mockedApi.post).toHaveBeenCalledWith("/objectives", payload);
    expect(result).toEqual({ id: 9, ...payload });
  });

  it("updates an objective", async () => {
    const payload = { targetAmount: 2000 };
    mockedApi.patch.mockResolvedValueOnce({ data: { id: 3, ...payload }, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await objectivesRepository.updateObjective(3, payload);

    expect(mockedApi.patch).toHaveBeenCalledWith("/objectives/3", payload);
    expect(result).toEqual({ id: 3, ...payload });
  });

  it("updates objective status", async () => {
    const payload = { status: "COMPLETADO" };
    mockedApi.patch.mockResolvedValueOnce({
      data: { id: 5, status: "COMPLETADO" },
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
    });

    const result = await objectivesRepository.updateObjectiveStatus(
      5,
      "COMPLETADO",
    );

    expect(mockedApi.patch).toHaveBeenCalledWith(
      "/objectives/5/status",
      payload,
    );
    expect(result).toEqual({ id: 5, status: "COMPLETADO" });
  });

  it("deletes an objective", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: undefined, status: 200, statusText: 'OK', headers: new Headers() });

    await objectivesRepository.deleteObjective(4);

    expect(mockedApi.delete).toHaveBeenCalledWith("/objectives/4");
  });
});
