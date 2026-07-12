/**
 * Admin Profile Hook
 * Main hook for admin profile screen - combines data, state, and handlers
 */

import { useState, useMemo } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../../store/authStore";
import {
  useThemeStore,
  useColors,
  useShadows,
  useIsDark,
} from "../../../store/themeStore";
import { useAdminStatsQuery } from "./useAdminStats";
import { useAdminAuditLogsProfileQuery } from "./useAdminAuditLogsProfile";
import { uploadApi } from "../../../api/uploadApi";
import type { AdminMenuItem } from "../domain/admin-profile.types";
import type { RootStackScreenProps } from "../../../navigation/types";
import { useNavigation } from "@react-navigation/native";

type Navigation = RootStackScreenProps<"Main">["navigation"];

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
  const auditLogsQuery = useAdminAuditLogsProfileQuery();

  // Local state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] =
    useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Computed values
  const isAdmin = user?.role === "ADMIN";
  const stats = statsQuery.data;

  const isLoading = statsQuery.isLoading;
  const isRefreshing = statsQuery.isRefetching;

  // Format number helper
  const formatNumber = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString("es-CU", { minimumFractionDigits: 2 });
  };

  // Handlers
  const handleAvatarPress = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceso a la galería para cambiar tu foto de perfil",
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploadingAvatar(true);
        try {
          const response = await uploadApi.uploadAvatar(result.assets[0].uri);

          // Update user in store directly with the response
          if (response.user) {
            // We need a way to update the user in the store without logging in again
            // For now, we'll force a refresh or rely on the user object being updated next app start
            // Ideally authStore should expose an 'updateUser' method
            useAuthStore.getState().setUser({
              ...user!,
              avatarUrl: response.avatarUrl, // Assuming response returns the relative path
            });
          }

          // Alert.alert('Éxito', 'Foto de perfil actualizada'); // Replaced with inline feedback or toast if available, silent success for now as UI updates
        } catch (error: any) {
          setErrorMessage(error.message || "Error al subir la imagen");
          setShowErrorModal(true);
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Avatar picker error:", error);
      setUploadingAvatar(false);
    }
  };

  const handleRefresh = async () => {
    await statsQuery.refetch();
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setErrorMessage("Complete todos los campos");
      setShowErrorModal(true);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Error al cambiar contraseña",
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  // Menu items configuration
  const menuItems: AdminMenuItem[] = useMemo(
    () => [
      {
        id: "theme",
        title: isDarkMode ? "Modo Claro" : "Modo Oscuro",
        subtitle: isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro",
        icon: isDarkMode ? "sunny-outline" : "moon-outline",
        color: isDarkMode ? "#F59E0B" : "#6366F1",
        onPress: toggleTheme,
      },
      {
        id: "password",
        title: "Cambiar Contraseña",
        subtitle: "Actualizar credenciales",
        icon: "lock-closed-outline",
        color: themeColors.primary[500],
        onPress: () => setShowPasswordForm(!showPasswordForm),
      },
      {
        id: "settings",
        title: "Configuración del Sistema",
        subtitle: "Ajustes generales",
        icon: "settings-outline",
        color: themeColors.secondary[500],
        onPress: () => Alert.alert("Configuración", "Próximamente"),
      },
      {
        id: "about",
        title: "Acerca de",
        subtitle: "Versión 1.0.0",
        icon: "information-circle-outline",
        color: themeColors.text.secondary,
        onPress: () =>
          Alert.alert(
            "Casa de Cambio",
            "Versión 1.0.0\nSistema de gestión para casa de cambio",
          ),
      },
    ],
    [isDarkMode, showPasswordForm, themeColors, navigation, toggleTheme],
  );

  return {
    // Data
    user,
    stats,
    isAdmin,
    isDarkMode,
    recentAuditLogs: auditLogsQuery.data ?? [],

    // State
    isLoading,
    isRefreshing,
    showPasswordForm,
    currentPassword,
    newPassword,
    loading,
    uploadingAvatar,
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
    handleAvatarPress,
    handleRefresh,
    handleChangePassword,
    handleLogout,
    confirmLogout,

    // Modals
    modalState: {
      showLogoutModal,
      setShowLogoutModal,
      showPasswordSuccessModal,
      setShowPasswordSuccessModal,
      showErrorModal,
      setShowErrorModal,
      errorMessage,
    },
  };
};
