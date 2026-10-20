import { API_CONFIG, STORAGE_KEYS } from "../config/constants";
import * as SecureStore from "expo-secure-store";
import type { ApiError } from "../types";

// Types para los interceptores
interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
}

interface ApiResponse<T = any> {
  data?: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Funciones de almacenamiento
const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }
};

const deleteStorageItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  }
};

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private requestInterceptors: Array<(config: RequestConfig) => Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: ApiResponse) => Promise<ApiResponse>> = [];
  private responseErrorInterceptors: Array<(error: any) => Promise<never>> = [];

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // Agregar interceptor de request
  interceptors = {
    request: {
      use: (handler: (config: RequestConfig) => Promise<RequestConfig>) => {
        this.requestInterceptors.push(handler);
      },
    },
    response: {
      use: (
        successHandler: (response: ApiResponse) => Promise<ApiResponse>,
        errorHandler?: (error: any) => Promise<never>
      ) => {
        this.responseInterceptors.push(successHandler);
        if (errorHandler) {
          this.responseErrorInterceptors.push(errorHandler);
        }
      },
    },
  };

  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  private async executeResponseInterceptors(response: ApiResponse): Promise<ApiResponse> {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
  }

  private async executeResponseErrorInterceptors(error: any): Promise<never> {
    for (const interceptor of this.responseErrorInterceptors) {
      try {
        return await interceptor(error);
      } catch (e) {
        // Continuar con el siguiente interceptor si uno falla
      }
    }
    throw error;
  }

  private buildQueryString(
    params: Record<string, string | number | boolean | undefined | null>,
  ): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
  }

  private async request<T = any>(
    method: string,
    url: string,
    options?: { data?: any; headers?: Record<string, string>; params?: Record<string, string | number | boolean | undefined | null> }
  ): Promise<ApiResponse<T>> {
    const queryString = options?.params ? this.buildQueryString(options.params) : '';
    const fullUrl = `${this.baseURL}${url}${queryString}`;

    // FormData (uploads) must not be JSON-stringified, and its Content-Type
    // must be left to fetch/React Native so the multipart boundary is set.
    const isFormData =
      typeof FormData !== "undefined" && options?.data instanceof FormData;

    let config: RequestConfig = {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    };

    if (options?.data) {
      config.body = isFormData ? options.data : JSON.stringify(options.data);
    }

    // Ejecutar interceptores de request
    config = await this.executeRequestInterceptors(config);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        data = await response.text();
      }

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };

      if (!response.ok) {
        const apiError: ApiError & {
          status: number;
          statusText: string;
          response: ApiResponse<T>;
        } = {
          message:
            (data as ApiError | undefined)?.message ||
            response.statusText ||
            "Request failed",
          statusCode: response.status,
          status: response.status,
          statusText: response.statusText,
          response: apiResponse,
        };

        throw apiError;
      }

      // Ejecutar interceptores de response
      return await this.executeResponseInterceptors(apiResponse);
    } catch (error) {
      clearTimeout(timeoutId);

      // Manejar errores con interceptores
      try {
        return await this.executeResponseErrorInterceptors(error);
      } catch (finalError) {
        throw finalError;
      }
    }
  }

  get<T = any>(url: string, options?: { headers?: Record<string, string>; params?: Record<string, string | number | boolean | undefined | null> }): Promise<ApiResponse<T>> {
    return this.request<T>("GET", url, options);
  }

  post<T = any>(
    url: string,
    data?: any,
    options?: { headers?: Record<string, string>; params?: Record<string, string | number | boolean | undefined | null> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", url, { data, ...options });
  }

  put<T = any>(
    url: string,
    data?: any,
    options?: { headers?: Record<string, string>; params?: Record<string, string | number | boolean | undefined | null> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", url, { data, ...options });
  }

  patch<T = any>(
    url: string,
    data?: any,
    options?: { headers?: Record<string, string>; params?: Record<string, string | number | boolean | undefined | null> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", url, { data, ...options });
  }

  delete<T = any>(url: string, options?: { data?: any; headers?: Record<string, string>; params?: Record<string, string | number | boolean | undefined | null> }): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", url, options);
  }
}

const api = new ApiClient(API_CONFIG.baseURL, API_CONFIG.timeout);

// Interceptor de request: Agregar token de autenticación
api.interceptors.request.use(async (config: RequestConfig) => {
  const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: Manejar errores 401
api.interceptors.response.use(
  async (response: ApiResponse) => response,
  async (error: any) => {
    if (error?.status === 401) {
      await deleteStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await deleteStorageItem(STORAGE_KEYS.USER);
    }
    throw error;
  }
);

export default api;
