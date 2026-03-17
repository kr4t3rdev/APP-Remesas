import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../config/constants';
import type { User, AuthResponse } from '../types';
import api from '../services/api';

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }
};

const deleteStorageItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mustChangePassword: boolean;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setMustChangePassword: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (currentPassword: string | undefined, newPassword: string) => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  mustChangePassword: false,

  setUser: (user) => set({ user, mustChangePassword: user?.mustChangePassword ?? false }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  setMustChangePassword: (value: boolean) => set({ mustChangePassword: value }),

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { access_token, user, mustChangePassword } = response.data;
      
      await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
      await setStorageItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        token: access_token, 
        isAuthenticated: true, 
        isLoading: false,
        mustChangePassword: mustChangePassword ?? false 
      });
      
      return mustChangePassword ?? false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await deleteStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    await deleteStorageItem(STORAGE_KEYS.USER);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    try {
      const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      const userStr = await getStorageItem(STORAGE_KEYS.USER);
      
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
      await setStorageItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
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
      
      // Actualizar el usuario en el store y local storage
      const { user } = get();
      if (user) {
        const updatedUser = { ...user, mustChangePassword: false };
        await setStorageItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        set({ user: updatedUser, mustChangePassword: false, isLoading: false });
      } else {
        set({ isLoading: false, mustChangePassword: false });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
