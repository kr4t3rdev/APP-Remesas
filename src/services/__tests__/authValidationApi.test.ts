import { checkEmailExists, checkNicknameExists } from "../authValidationApi";
import api from "../api";

jest.mock("../api");

describe("Auth Validation API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkEmailExists", () => {
    it("should return true if email exists", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { exists: true },
      });

      const result = await checkEmailExists("existing@example.com");
      expect(result).toBe(true);
      expect(api.get).toHaveBeenCalledWith("/auth/check-email", {
        params: { email: "existing@example.com" },
      });
    });

    it("should return false if email doesn't exist", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { exists: false },
      });

      const result = await checkEmailExists("new@example.com");
      expect(result).toBe(false);
    });

    it("should return false if response doesn't have exists property", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: {},
      });

      const result = await checkEmailExists("test@example.com");
      expect(result).toBe(false);
    });

    it("should throw error on API failure", async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(checkEmailExists("test@example.com")).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("checkNicknameExists", () => {
    it("should return true if nickname exists", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { exists: true },
      });

      const result = await checkNicknameExists("existinguser");
      expect(result).toBe(true);
      expect(api.get).toHaveBeenCalledWith("/auth/check-nickname", {
        params: { nickname: "existinguser" },
      });
    });

    it("should return false if nickname doesn't exist", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { exists: false },
      });

      const result = await checkNicknameExists("newuser");
      expect(result).toBe(false);
    });

    it("should return false if response doesn't have exists property", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: {},
      });

      const result = await checkNicknameExists("testuser");
      expect(result).toBe(false);
    });

    it("should handle empty nickname gracefully", async () => {
      const result = await checkNicknameExists("");
      expect(result).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("should throw error on API failure", async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(checkNicknameExists("testuser")).rejects.toThrow(
        "API Error"
      );
    });
  });
});
