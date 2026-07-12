import api from "../../../services/api";
import { cashRepository } from "./cash.repository";

jest.mock("../../../services/api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("cashRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests the cash overview", async () => {
    const overview = { balances: [], recentMovements: [], latestAudits: [] };
    mockedApi.get.mockResolvedValueOnce({ data: overview, status: 200, statusText: 'OK', headers: new Headers() });

    const result = await cashRepository.getOverview();

    expect(mockedApi.get).toHaveBeenCalledWith("/cash/overview");
    expect(result).toEqual(overview);
  });
});
