import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import { Button } from "../../components/ui/Button";
import { spacing, borderRadius } from "../../theme";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";
import { useAuthStore } from "../../store/authStore";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  useThemeStore,
  useColors,
  useIsDark,
  useShadows,
} from "../../store/themeStore";
import type { RootStackScreenProps } from "../../navigation/types";
import { useNavigation } from "@react-navigation/native";

import { useTabBarScrollBehavior, useTabScrollToTop } from "../../navigation/TabBarMotionProvider";
import { ChangePasswordModal } from "../../components/profile/ChangePasswordModal";
import { AboutModal } from "../../components/profile/AboutModal";

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
};

export const ProfileScreen: React.FC = () => {
  const tabBarScrollBehavior = useTabBarScrollBehavior();
  const profileScrollRef = useRef<ScrollView>(null);
  const scrollToTop = useCallback(() => {
    profileScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);
  useTabScrollToTop("Profile", scrollToTop);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "primary" | "warning";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const changePassword = useAuthStore((state) => state.changePassword);
  const navigation =
    useNavigation<RootStackScreenProps<"Main">["navigation"]>();

  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDarkMode = useIsDark();
  const styles = useMemo(
    () => createStyles(themeColors, themeShadows),
    [themeColors, themeShadows],
  );

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const handleRefresh = async () => {
  };

  const handleChangePassword = async (current: string, newPwd: string) => {
    await changePassword(current, newPwd);
    Alert.alert("Éxito", "Contraseña actualizada");
  };

  const handleLogout = () => {
    setConfirmModal({
      visible: true,
      title: "Cerrar Sesión",
      message: "¿Está seguro que desea cerrar sesión?",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        try {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" as never }],
          });
        } catch (error) {
          Alert.alert("Error", "No se pudo cerrar sesión");
        }
      },
    });
  };

  const menuItems: MenuItem[] = [
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
      onPress: () => setShowChangePasswordModal(true),
    },
    {
      id: "about",
      title: "Acerca de",
      subtitle: "Versión 1.0.0",
      icon: "information-circle-outline",
      color: themeColors.text.secondary,
      onPress: () => setShowAboutModal(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={profileScrollRef}
        {...tabBarScrollBehavior}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
      >
        <FadeIn>
          <View style={styles.header}>
            <Text style={styles.title}>Perfil</Text>
            <Text style={styles.subtitle}>
              {isAdmin
                ? "Cuenta administrativa y configuración operativa"
                : "Tu cuenta y configuración"}
            </Text>
          </View>
        </FadeIn>

        <FadeInDown delay={50}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={40}
                  color={themeColors.primary[500]}
                />
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {!!user?.blockedUntil && (
              <Text style={[styles.userEmail, { color: themeColors.warning }]}>
                Bloqueado hasta: {new Date(user.blockedUntil).toLocaleString()}
              </Text>
            )}
            {!!user?.isBanned && (
              <Text style={[styles.userEmail, { color: themeColors.danger }]}>
                Usuario baneado
              </Text>
            )}
          </View>
        </FadeInDown>

        <FadeInDown delay={100}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            {menuItems.map((item, index) => (
              <ScaleIn key={item.id} delay={400 + index * 50}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={themeColors.text.tertiary}
                  />
                </TouchableOpacity>
              </ScaleIn>
            ))}
          </View>
        </FadeInDown>

        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={{ color: themeColors.danger }}
        />

      </ScrollView>

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onChangePassword={handleChangePassword}
      />

      <AboutModal
        visible={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (
  themeColors: ReturnType<typeof useColors>,
  themeShadows: ReturnType<typeof useShadows>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: floatingTabBarMetrics.contentBottomPadding,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
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
      alignItems: "center",
      marginBottom: spacing.lg,
      ...themeShadows.md,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: themeColors.primary[100],
      justifyContent: "center",
      alignItems: "center",
    },
    roleBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: themeColors.primary[500],
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    roleText: {
      fontSize: 10,
      fontWeight: "600",
      color: themeColors.text.inverse,
      textTransform: "uppercase",
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      color: themeColors.text.primary,
    },
    userEmail: {
      fontSize: 14,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: themeColors.text.primary,
      marginBottom: spacing.sm,
    },
    menuItem: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
      ...themeShadows.sm,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      justifyContent: "center",
      alignItems: "center",
    },
    menuInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    menuTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: themeColors.text.primary,
    },
    menuSubtitle: {
      fontSize: 12,
      color: themeColors.text.secondary,
      marginTop: 2,
    },
    logoutButton: {
      marginTop: spacing.md,
    },
  });
