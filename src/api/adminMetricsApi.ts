import api from "../services/api";
import { AdminMetrics } from "../types/adminMetrics";

// Fetch admin service metrics from the API (GET /admin/metrics/services).
// Goes through the shared ApiClient so the auth token, timeout and 401
// handling are the same as every other module. Errors propagate to the
// caller — never substitute fabricated metrics for a failed request.
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const response = await api.get<AdminMetrics>("/admin/metrics/services");
  const data = response.data ?? ({} as Partial<AdminMetrics>);
  return {
    activeCount: data.activeCount ?? 0,
    expiredCount: data.expiredCount ?? 0,
    activeDelta: data.activeDelta ?? "0%",
    expiredDelta: data.expiredDelta ?? "0%",
  };
}
