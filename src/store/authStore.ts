import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../config/constants';
import type { User, AuthResponse } from '../types';
import api from '../services/api';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  getCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get<User>('/auth/me');
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(response.data));
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      await api.post<{ message: string }>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
