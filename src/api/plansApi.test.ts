import api from "../services/api";
import { plansApi } from "./plansApi";

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("plansApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a plan with admin-defined cost", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        id: 7,
        name: "Plan Pro",
        description: "desc",
        isActive: true,
        monthlyUsd: 99,
        semiannualUsd: 594,
        annualUsd: 1188,
      },
    });

    await plansApi.createPlan({
      name: "Plan Pro",
      price: 99,
      description: "desc",
      benefits: [{ id: "1", text: "X" }],
      tags: ["tag"],
      icon: "star",
      isActive: true,
      isPopular: true,
      themeColor: "#fff",
    });

    expect(api.post).toHaveBeenCalledWith("/plans", {
      name: "Plan Pro",
      description: "desc",
      isActive: true,
      monthlyUsd: 99,
    });
  });

  it("updates a plan using PATCH endpoint", async () => {
    (api.patch as jest.Mock).mockResolvedValue({
      data: {
        id: 7,
        name: "Plan Pro",
        description: "",
        isActive: true,
        monthlyUsd: 120,
        semiannualUsd: 720,
        annualUsd: 1440,
      },
    });

    await plansApi.updatePlan("7", { name: "Plan Pro", price: 120 });

    expect(api.patch).toHaveBeenCalledWith("/plans/7", {
      name: "Plan Pro",
      monthlyUsd: 120,
    });
  });
});
