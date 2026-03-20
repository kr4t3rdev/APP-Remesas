import api from './api';

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};
