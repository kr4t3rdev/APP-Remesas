import api from "./api";

/**
 * Checks if email already exists in the system
 * @param email The email to check
 * @returns true if email exists, false otherwise
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await api.get("/auth/check-email", {
      params: { email },
    });
    return response.data.exists ?? false;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
};

/**
 * Checks if nickname already exists in the system
 * @param nickname The nickname to check
 * @returns true if nickname exists, false otherwise
 */
export const checkNicknameExists = async (
  nickname: string
): Promise<boolean> => {
  // Don't check empty nicknames
  if (!nickname) return false;

  try {
    const response = await api.get("/auth/check-nickname", {
      params: { nickname },
    });
    return response.data.exists ?? false;
  } catch (error) {
    console.error("Error checking nickname existence:", error);
    throw error;
  }
};
