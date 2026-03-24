import { AdminMetrics } from "../types/adminMetrics";
import { API_CONFIG } from "../config/constants";

// URL base del API
const BASE_URL = API_CONFIG.baseURL;

// Mock data as fallback
const mockMetrics: AdminMetrics = {
  activeCount: 1240,
  expiredCount: 85,
  activeDelta: "+12%",
  expiredDelta: "-5%",
};

// Fetch admin metrics from the API
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  try {
    // Get token from secure storage
    let token: string | null = null;
    try {
      const SecureStore = require("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_token");
    } catch {
      // Ignore storage errors
    }

    const response = await fetch(`${BASE_URL}/admin/metrics/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      console.warn(
        "[adminMetricsApi] API returned error, using fallback:",
        response.status,
      );
      return mockMetrics;
    }

    const data = await response.json();
    return {
      activeCount: data.activeCount ?? 0,
      expiredCount: data.expiredCount ?? 0,
      activeDelta: data.activeDelta ?? "0%",
      expiredDelta: data.expiredDelta ?? "0%",
    };
  } catch (error) {
    console.warn(
      "[adminMetricsApi] Failed to fetch metrics, using fallback:",
      error,
    );
    return mockMetrics;
  }
}
