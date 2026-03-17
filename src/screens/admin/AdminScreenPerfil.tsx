/**
 * Admin Profile Screen
 * Profile screen specifically designed for administrators
 * Shows admin-specific stats, menu options, and configurations
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown, ScaleIn } from '../../components/animations';
import { StatsCard } from '../../components/charts/Charts';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { spacing, borderRadius } from '../../theme';
import { useAdminProfile } from '../../modules/admin/application/useAdminProfile';
import { API_CONFIG } from '../../config/constants';

import { AdminLogoutModal } from '../../components/admin/AdminLogoutModal';
import { AdminChangePasswordSuccessModal } from '../../components/admin/AdminChangePasswordSuccessModal';
import { ErrorModal } from '../../components/admin/ErrorModal';

export const AdminScreenPerfil: React.FC = () => {
  const {
    user,
    stats,
    isAdmin,
    isDarkMode,
    isLoading,
    isRefreshing,
    showPasswordForm,
    currentPassword,
    newPassword,
    loading,
    uploadingAvatar,
    statsLoaded,
    setShowPasswordForm,
    setCurrentPassword,
    setNewPassword,
    formatNumber,
    themeColors,
    themeShadows,
    menuItems,
    handleRefresh,
    handleChangePassword,
    handleLogout,
    confirmLogout,
    handleAvatarPress,
    modalState,
  } = useAdminProfile();

  const styles = createStyles(themeColors, themeShadows);

  // Helper to construct full avatar URL
  const getAvatarSource = () => {
    if (user?.avatarUrl) {
      // If it's a full URL, use it
      if (user.avatarUrl.startsWith('http')) return { uri: user.avatarUrl };
      // Otherwise prepend base URL
      return { uri: `${API_CONFIG.baseURL}${user.avatarUrl}` };
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
      >
        {/* Header */}
        <FadeIn>
          <View style={styles.header}>
            <Text style={styles.title}>Perfil Admin</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? 'Cuenta administrativa y configuración operativa' : 'Tu cuenta'}
            </Text>
          </View>
        </FadeIn>

        {/* Profile Card */}
        <FadeInDown delay={50}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity 
                style={styles.avatarWrapper}
                onPress={handleAvatarPress}
                disabled={uploadingAvatar}
              >
                {user?.avatarUrl ? (
                  <Image source={getAvatarSource()} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color={themeColors.primary[500]} />
                  </View>
                )}
                
                {uploadingAvatar && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
                
                <View style={styles.editIconBadge}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
              </TouchableOpacity>
              
              <View style={[styles.roleBadge, { backgroundColor: themeColors.danger }]}>
                <Text style={styles.roleText}>ADMIN</Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {!!user?.blockedUntil && (
              <Text style={[styles.userEmail, { color: themeColors.warning }]}>
                Bloqueado hasta: {new Date(user.blockedUntil).toLocaleString()}
              </Text>
            )}
          </View>
        </FadeInDown>

        {/* Admin Stats Grid */}
        {statsLoaded && stats && (
          <FadeInDown delay={100}>
            <View style={styles.statsGrid}>
              <ScaleIn delay={120}>
                <StatsCard
                  title="Total Usuarios"
                  value={stats.totalUsers.toString()}
                  icon={<Ionicons name="people" size={20} color={themeColors.primary[500]} />}
                  color={themeColors.primary[500]}
                  style={styles.statCard}
                />
              </ScaleIn>
              <ScaleIn delay={140}>
                <StatsCard
                  title="Activos"
                  value={stats.activeUsers.toString()}
                  icon={<Ionicons name="checkmark-circle" size={20} color={themeColors.success} />}
                  color={themeColors.success}
                  style={styles.statCard}
                />
              </ScaleIn>
            </View>
          </FadeInDown>
        )}

        {statsLoaded && stats && (
          <FadeInDown delay={160}>
            <View style={styles.statsGrid}>
              <ScaleIn delay={180}>
                <StatsCard
                  title="Licencias Activas"
                  value={stats.activeLicenses.toString()}
                  icon={<Ionicons name="key" size={20} color={themeColors.warning} />}
                  color={themeColors.warning}
                  style={styles.statCard}
                />
              </ScaleIn>
              <ScaleIn delay={200}>
                <StatsCard
                  title="Ingresos del Día"
                  value={`$ ${formatNumber(stats.dailyRevenue)}`}
                  icon={<Ionicons name="trending-up" size={20} color={themeColors.success} />}
                  color={themeColors.success}
                  style={styles.statCard}
                />
              </ScaleIn>
            </View>
          </FadeInDown>
        )}

        {/* Configuration Menu */}
        <FadeInDown delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            {menuItems.map((item, index) => (
              <ScaleIn key={item.id} delay={320 + index * 40}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.badge !== undefined && (
                    <View style={[styles.badge, { backgroundColor: themeColors.danger }]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={themeColors.text.tertiary} />
                </TouchableOpacity>
              </ScaleIn>
            ))}
          </View>
        </FadeInDown>

        {/* Password Change Form */}
        {showPasswordForm && (
          <FadeInDown>
            <View style={styles.passwordForm}>
              <Text style={styles.formTitle}>Cambiar Contraseña</Text>
              <Input
                label="Contraseña Actual"
                placeholder="••••••••"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <View style={{ marginTop: spacing.sm }}>
                <Input
                  label="Nueva Contraseña"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.formButtons}>
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Guardar"
                  onPress={handleChangePassword}
                  loading={loading}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </FadeInDown>
        )}

        {/* Logout Button */}
        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={{ color: themeColors.danger }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <AdminLogoutModal
        visible={modalState.showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => modalState.setShowLogoutModal(false)}
      />

      <AdminChangePasswordSuccessModal
        visible={modalState.showPasswordSuccessModal}
        onClose={() => modalState.setShowPasswordSuccessModal(false)}
      />

      <ErrorModal
        visible={modalState.showErrorModal}
        title="Error"
        message={modalState.errorMessage}
        onClose={() => modalState.setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (themeColors: any, themeShadows: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: themeColors.text.primary,
    },
    subtitle: {
      fontSize: 14,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
    profileCard: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.lg,
      ...themeShadows.glow, // Updated to glow for better prominence
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.md,
    },
    avatarWrapper: {
      position: 'relative',
      width: 80,
      height: 80,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: themeColors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editIconBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: themeColors.primary[500],
      width: 28, // Slightly larger for touch target
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: themeColors.card,
      ...themeShadows.sm, // Add shadow for depth
    },
    roleBadge: {
      position: 'absolute',
      bottom: -10,
      alignSelf: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      zIndex: 1,
    },
    roleText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#fff',
      textTransform: 'uppercase',
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: themeColors.text.primary,
    },
    userEmail: {
      fontSize: 14,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    statCard: {
      flex: 1,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: spacing.sm,
    },
    seeAll: {
      fontSize: 14,
      color: themeColors.primary[500],
      fontWeight: '500',
    },
    auditItem: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      ...themeShadows.sm,
    },
    auditIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    auditInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    auditAction: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    auditDate: {
      fontSize: 12,
      color: themeColors.text.secondary,
      marginTop: 2,
    },
    menuItem: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      ...themeShadows.sm,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    menuTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    menuSubtitle: {
      fontSize: 12,
      color: themeColors.text.secondary,
      marginTop: 2,
    },
    badge: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      marginRight: spacing.sm,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    passwordForm: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      ...themeShadows.sm,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: spacing.md,
    },
    formButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    logoutButton: {
      marginTop: spacing.md,
    },
  });
