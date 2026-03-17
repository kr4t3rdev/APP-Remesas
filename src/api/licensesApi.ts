import api from '../services/api';
import { License, LicenseDetail, LicenseStatus } from '../types/licenses';

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

const mapBackendLicenseToFrontend = (license: BackendUserLicense): License => {
  let status: LicenseStatus = 'pending';
  switch (license.state) {
    case 'ACTIVE':
    case 'TRIAL':
    case 'GRACE':
      status = 'active';
      break;
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'CANCELLED':
      status = 'expired';
      break;
    default:
      status = 'pending';
  }

  return {
    id: license.id.toString(),
    planName: license.plan.name,
    licenseKey: `LIC-${license.id.toString().padStart(6, '0')}`,
    status,
    assignedUsers: [
      {
        id: license.user.id.toString(),
        name: license.user.name,
        // avatar: license.user.avatar, // Backend doesn't send avatar yet
      },
    ],
    expiryDate: new Date(license.expiresAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    autoRenew: true, // Defaulting to true for now
  };
};

export const licensesApi = {
  fetchLicenses: async (): Promise<License[]> => {
    const response = await api.get<BackendUserLicense[]>('/subscriptions/licenses');
    return response.data.map(mapBackendLicenseToFrontend);
  },

  fetchLicenseDetails: async (id: string): Promise<LicenseDetail | null> => {
    try {
      const response = await api.get<BackendUserLicense>(`/subscriptions/licenses/${id}`);
      const baseLicense = mapBackendLicenseToFrontend(response.data);
      
      // Enhance with detail fields
      return {
        ...baseLicense,
        billingCycle: response.data.cycle === 'MONTHLY' ? 'Mensual' : 
                      response.data.cycle === 'SEMIANNUAL' ? 'Semestral' : 'Anual',
        maxUsers: 1,
        usedUsers: 1,
        fullUserList: [
          {
            id: response.data.user.id.toString(),
            name: response.data.user.name,
            email: response.data.user.email,
            role: 'Admin', // Default role
            status: 'online',
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching license details:', error);
      return null;
    }
  },
};
