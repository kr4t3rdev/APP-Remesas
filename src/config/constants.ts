import { Platform } from 'react-native';

const getBaseURL = () => {
  // Detectar entorno y plataforma
  if (__DEV__) {
    // iOS Simulator: usa localhost
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api';
    }
    // Android Emulator: usa 10.0.2.2 (IP especial del emulador)
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    // Dispositivo físico: usa la IP de tu computadora
    // Cambia esta IP por la de tu red local
    return 'http://192.168.1.100:3000/api';
  }
  return 'https://your-production-url.com/api';
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user_data',
};
