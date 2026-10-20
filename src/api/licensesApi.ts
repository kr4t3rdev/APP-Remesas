import api from "../services/api";
import { License, LicenseDetail, LicenseStatus } from "../types/licenses";
import { subscriptionsRepository } from "../modules/subscriptions/infrastructure/subscriptions.repository";

// Keep backend types locally if needed, but we'll adapt to use subscriptionsRepository
interface BackendUserLicense {
  id: number;
  userId: number;
  planId: number;
  state: string;
  cycle: string;
  expiresAt: string;
  plan: {
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const mapBackendLicenseToFrontend = (license: any): License => {
  let status: LicenseStatus = "pending";
  switch (license.state) {
    case "ACTIVE":
    case "TRIAL":
    case "GRACE":
      status = "active";
      break;
    case "EXPIRED":
    case "SUSPENDED":
    case "CANCELLED":
      status = "expired";
      break;
    default:
      status = "pending";
  }

  return {
    id: license.id.toString(),
    planName: license.plan?.name || "Plan Desconocido",
    licenseKey: `LIC-${license.id.toString().padStart(6, "0")}`,
    status,
    assignedUsers: [
      {
        id: license.user?.id?.toString() || license.userId?.toString() || "0",
        name: license.user?.name || "Usuario",
        // avatar: license.user.avatar, // Backend doesn't send avatar yet
      },
    ],
    expiryDate: new Date(license.expiresAt).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    expiresAtRaw: license.expiresAt,
    planId: license.planId,
    billingCycle: (license.cycle as
      | "MONTHLY"
      | "SEMIANNUAL"
      | "ANNUAL"
      | undefined) ?? "MONTHLY",
    autoRenew: true, // Defaulting to true for now
  };
};

export type BillingCycle = "MONTHLY" | "SEMIANNUAL" | "ANNUAL";

export interface AssignLicensePayload {
  userId: number;
  planId: number;
  cycle: BillingCycle;
  expiresAt?: string;
}

export const licensesApi = {
  fetchLicenses: async (): Promise<License[]> => {
    const data = await subscriptionsRepository.getLicenses();
    return data.map(mapBackendLicenseToFrontend);
  },

  assignLicense: async (payload: AssignLicensePayload): Promise<void> => {
    await subscriptionsRepository.assignLicense({
      userId: payload.userId,
      planId: payload.planId,
      cycle: payload.cycle,
      expiresAt: payload.expiresAt,
    });
  },

  extendLicense: async (
    id: string,
    planId: number,
    cycle: BillingCycle,
  ): Promise<void> => {
    // Backend contract (RenewLicenseDto): PATCH /subscriptions/licenses/:id/renew
    // requires { planId, cycle }. It rejects any other property
    // (ValidationPipe forbidNonWhitelisted), so never send { months }.
    await subscriptionsRepository.renewLicense(Number(id), { planId, cycle });
  },

  // NOTE: there is intentionally no deleteLicense / removeUserFromLicense.
  // The backend exposes no DELETE route under /subscriptions/licenses —
  // calling one returned 404. License lifecycle is renew/suspend/reactivate.

  fetchLicenseDetails: async (id: string): Promise<LicenseDetail | null> => {
    try {
      const response = await api.get<BackendUserLicense>(
        `/subscriptions/licenses/${id}`,
      );
      const baseLicense = mapBackendLicenseToFrontend(response.data);

      // Enhance with detail fields
      return {
        ...baseLicense,
        billingCycle:
          response.data!.cycle === "MONTHLY"
            ? "Mensual"
            : response.data!.cycle === "SEMIANNUAL"
              ? "Semestral"
              : "Anual",
        maxUsers: 1,
        usedUsers: 1,
        fullUserList: [
          {
            id: response.data!.user?.id?.toString() || "0",
            name: response.data!.user?.name || "Usuario",
            email: response.data!.user?.email || "",
            role: "Admin", // Default role
            status: "online",
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching license details:", error);
      return null;
    }
  },
};
