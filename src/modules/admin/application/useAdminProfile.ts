/**
 * Admin Profile Hook
 * Main hook for admin profile screen - combines data, state, and handlers
 */

import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore, useColors, useShadows, useIsDark } from '../../../store/themeStore';
import { useAdminStatsQuery } from './useAdminStats';
import { useAdminAuditLogsProfileQuery } from './useAdminAuditLogsProfile';
import type { AdminMenuItem } from '../domain/admin-profile.types';
import type { RootStackScreenProps } from '../../../navigation/types';
import { useNavigation } from '@react-navigation/native';

type Navigation = RootStackScreenProps<'Main'>['navigation'];

export const useAdminProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const changePassword = useAuthStore((state) => state.changePassword);
  
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDarkMode = useIsDark();
  
  const navigation = useNavigation<Navigation>();

  // Queries
  const statsQuery = useAdminStatsQuery();
  const auditLogsQuery = useAdminAuditLogsProfileQuery(5);

  // Local state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Computed values
  const isAdmin = user?.role === 'ADMIN';
  const stats = statsQuery.data;
  const recentAuditLogs = auditLogsQuery.data ?? [];
  
  const isLoading = statsQuery.isLoading;
  const isRefreshing = statsQuery.isRefetching || auditLogsQuery.isRefetching;

  // Format number helper
  const formatNumber = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString('es-CU', { minimumFractionDigits: 2 });
  };

  // Handlers
  const handleRefresh = async () => {
    await Promise.all([
      statsQuery.refetch(),
      auditLogsQuery.refetch(),
    ]);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Éxito', 'Contraseña actualizada');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Menu items configuration
  const menuItems: AdminMenuItem[] = useMemo(() => [
    {
      id: 'theme',
      title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
      subtitle: isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
      icon: isDarkMode ? 'sunny-outline' : 'moon-outline',
      color: isDarkMode ? '#F59E0B' : '#6366F1',
      onPress: toggleTheme,
    },
    {
      id: 'password',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualizar credenciales',
      icon: 'lock-closed-outline',
      color: themeColors.primary[500],
      onPress: () => setShowPasswordForm(!showPasswordForm),
    },
    {
      id: 'licenses',
      title: 'Gestión de Licencias',
      subtitle: stats?.expiringLicenses 
        ? `${stats.expiringLicenses} por vencer` 
        : 'Administrar licencias',
      icon: 'key-outline',
      color: themeColors.warning,
      badge: stats?.expiringLicenses,
      onPress: () => navigation.navigate('AdminHome' as never),
    },
    {
      id: 'audit',
      title: 'Auditoría',
      subtitle: `${recentAuditLogs.length} acciones recientes`,
      icon: 'shield-checkmark-outline',
      color: themeColors.success,
      onPress: () => navigation.navigate('AdminReports' as never),
    },
    {
      id: 'settings',
      title: 'Configuración del Sistema',
      subtitle: 'Ajustes generales',
      icon: 'settings-outline',
      color: themeColors.secondary[500],
      onPress: () => Alert.alert('Configuración', 'Próximamente'),
    },
    {
      id: 'about',
      title: 'Acerca de',
      subtitle: 'Versión 1.0.0',
      icon: 'information-circle-outline',
      color: themeColors.text.secondary,
      onPress: () => Alert.alert('Casa de Cambio', 'Versión 1.0.0\nSistema de gestión para casa de cambio'),
    },
  ], [
    isDarkMode, 
    showPasswordForm, 
    themeColors, 
    stats, 
    recentAuditLogs.length, 
    navigation,
    toggleTheme
  ]);

  return {
    // Data
    user,
    stats,
    recentAuditLogs,
    isAdmin,
    isDarkMode,
    
    // State
    isLoading,
    isRefreshing,
    showPasswordForm,
    currentPassword,
    newPassword,
    loading,
    statsLoaded: statsQuery.data !== undefined,
    
    // Setters
    setShowPasswordForm,
    setCurrentPassword,
    setNewPassword,
    
    // Helpers
    formatNumber,
    themeColors,
    themeShadows,
    menuItems,
    
    // Handlers
    handleRefresh,
    handleChangePassword,
    handleLogout,
  };
};
