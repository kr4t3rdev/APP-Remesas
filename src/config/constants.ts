import { Platform } from 'react-native';

// Variables de entorno para configurar URLs de API
// Ver .env.example para documentación
const ENV = {
  // URL para web (localhost por defecto)
  WEB_API_URL: process.env.EXPO_PUBLIC_WEB_API_URL || 'http://localhost:3000/api',
  // URL para dispositivos físicos
  PHYSICAL_API_URL: process.env.EXPO_PUBLIC_PHYSICAL_API_URL || 'http://192.168.1.100:3000/api',
  // URL de producción
  PROD_API_URL: process.env.EXPO_PUBLIC_PROD_API_URL || 'https://your-production-url.com/api',
};

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
    // Web: usa variable de entorno o localhost por defecto
    if (Platform.OS === 'web') {
      return ENV.WEB_API_URL;
    }
    // Dispositivo físico: usa variable de entorno o IP por defecto
    return ENV.PHYSICAL_API_URL;
  }
  // Producción
  return ENV.PROD_API_URL;
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user_data',
};
