export type LicenseStatus = 'active' | 'expired' | 'subscribed' | 'pending';

export interface LicenseUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface License {
  id: string;
  planName: string;
  licenseKey: string;
  status: LicenseStatus;
  assignedUsers: LicenseUser[];
  expiryDate?: string; // "12 Dic 2024" or ISO
  autoRenew: boolean;
}

export interface LicenseUserDetail {
  id: string;
  name: string;
  email: string;
  role: string; // "Admin", "Editor", "Viewer"
  status: 'online' | 'offline';
  avatarUrl?: string;
}

export interface LicenseDetail extends License {
  billingCycle: string; // "Facturación Anual"
  maxUsers: number;
  usedUsers: number;
  fullUserList: LicenseUserDetail[];
}
