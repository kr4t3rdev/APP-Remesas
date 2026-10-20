import api from "../services/api";
import { fetchAdminMetrics } from "./adminMetricsApi";

jest.mock("../services/api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

describe("fetchAdminMetrics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls the real endpoint through the shared client and maps fields", async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { activeCount: 10, expiredCount: 2, activeDelta: "+3%", expiredDelta: "-1%" },
    });
    await expect(fetchAdminMetrics()).resolves.toEqual({
      activeCount: 10,
      expiredCount: 2,
      activeDelta: "+3%",
      expiredDelta: "-1%",
    });
    expect(api.get).toHaveBeenCalledWith("/admin/metrics/services");
  });

  it("propagates API errors instead of returning fabricated metrics", async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error("500"));
    await expect(fetchAdminMetrics()).rejects.toThrow("500");
  });
});
