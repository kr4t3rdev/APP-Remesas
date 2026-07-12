import api from "./api";

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export const verifyEmail = async (
  token: string,
): Promise<VerifyEmailResponse> => {
  const response = await api.post<VerifyEmailResponse>("/auth/verify-email", {
    token,
  });
  return response.data!;
};

export const resendVerification = async (
  email: string,
): Promise<ResendVerificationResponse> => {
  const response = await api.post<ResendVerificationResponse>(
    "/auth/resend-verification",
    { email },
  );
  return response.data!;
};
