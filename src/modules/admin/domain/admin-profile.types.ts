/**
 * Domain types for Admin Profile feature
 * Types specific to the admin profile screen
 */

import type { User } from "../../../types";

/**
 * Statistics displayed on admin profile dashboard
 */
export interface AdminProfileStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  expiringLicenses: number;
  dailyRevenue: number;
  activeLicenses: number;
}

/**
 * Summary of audit log entries for admin profile
 */
export interface AdminAuditLogSummary {
  id: number;
  action: string;
  targetUser: string | null;
  adminName: string;
  createdAt: string;
}

/**
 * Menu item configuration for admin profile settings
 */
export interface AdminMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
  badge?: number | string;
  requiresAuth?: boolean;
}

/**
 * ViewModel state for admin profile screen
 */
export interface AdminProfileViewModel {
  user: User | null;
  stats: AdminProfileStats | null;
  recentAuditLogs: AdminAuditLogSummary[];
  isAdmin: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  showPasswordForm: boolean;
  statsLoaded: boolean;
}
