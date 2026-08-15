import api from "../../../services/api";
import type {
  BillingCycle,
  SubscriptionPayment,
  UserLicense,
} from "../../../types";

export const subscriptionsRepository = {
  async getLicenses(userId?: number): Promise<UserLicense[]> {
    const response = await api.get<UserLicense[]>("/subscriptions/licenses", {
      params: userId ? { userId } : undefined,
    });
    return response.data!;
  },

  async assignLicense(data: {
    userId: number;
    planId: number;
    cycle: BillingCycle;
    state?: string;
    expiresAt?: string;
    reason?: string;
  }): Promise<UserLicense> {
    const response = await api.post<UserLicense>(
      "/subscriptions/licenses",
      data,
    );
    return response.data!;
  },

  async renewLicense(
    id: number,
    data: { planId: number; cycle: BillingCycle; months?: number },
  ): Promise<UserLicense> {
    const response = await api.patch<UserLicense>(
      `/subscriptions/licenses/${id}/renew`,
      data,
    );
    return response.data!;
  },

  async suspendLicense(id: number, reason?: string): Promise<UserLicense> {
    const response = await api.patch<UserLicense>(
      `/subscriptions/licenses/${id}/suspend`,
      {
        reason,
      },
    );
    return response.data!;
  },

  async reactivateLicense(id: number, reason?: string): Promise<UserLicense> {
    const response = await api.patch<UserLicense>(
      `/subscriptions/licenses/${id}/reactivate`,
      {
        reason,
      },
    );
    return response.data!;
  },

  async registerPayment(data: {
    userId: number;
    userLicenseId?: number;
    planId: number;
    cycle: BillingCycle;
    amountUsd: number;
    exchangeRateUsed: number;
    bankAccountId?: number;
    paidAt?: string;
    notes?: string;
  }): Promise<SubscriptionPayment> {
    const response = await api.post<SubscriptionPayment>(
      "/subscriptions/payments",
      data,
    );
    return response.data!;
  },
};
