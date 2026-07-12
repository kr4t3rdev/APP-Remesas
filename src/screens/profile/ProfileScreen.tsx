import React, { useMemo, useState } from "react";
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
import { StatsCard, CircularProgress } from "../../components/charts/Charts";
import { Input } from "../../components/ui/Input";
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
import {
  useProfileActiveObjectivesQuery,
  useProfileBankAccountsQuery,
  useProfileCashBalancesQuery,
  useProfileDailyReportQuery,
} from "../../modules/profile/application/useProfile";

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
};

export const ProfileScreen: React.FC = () => {
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

  const bankAccountsQuery = useProfileBankAccountsQuery();
  const objectivesQuery = useProfileActiveObjectivesQuery();
  const cashBalancesQuery = useProfileCashBalancesQuery();
  const dailyReportQuery = useProfileDailyReportQuery();

  const bankAccounts = bankAccountsQuery.data ?? [];
  const objectives = objectivesQuery.data ?? [];
  const cashBalances = cashBalancesQuery.data ?? [];
  const dailyReport = dailyReportQuery.data;
  const safeDailyReport = dailyReport ?? {
    profit: { net: 0 },
    transactions: { total: 0 },
  };

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const handleRefresh = async () => {
    await Promise.all([
      bankAccountsQuery.refetch(),
      objectivesQuery.refetch(),
      cashBalancesQuery.refetch(),
      dailyReportQuery.refetch(),
    ]);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Complete todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Éxito", "Contraseña actualizada");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error al cambiar contraseña",
      );
    } finally {
      setLoading(false);
    }
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

  const formatNumber = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString("es-CU", { minimumFractionDigits: 2 });
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
      onPress: () => setShowPasswordForm(!showPasswordForm),
    },
    {
      id: "rates",
      title: "Tasas de Cambio",
      subtitle: "Configurar tasas de referencia",
      icon: "swap-horizontal-outline",
      color: themeColors.success,
      onPress: () => navigation.navigate("ExchangeRates"),
    },
    {
      id: "currencies",
      title: "Monedas",
      subtitle: "Gestionar monedas y principal",
      icon: "cash-outline",
      color: themeColors.secondary[500],
      onPress: () => navigation.navigate("Currencies"),
    },
    {
      id: "accounts",
      title: "Cuentas Bancarias",
      subtitle: `${bankAccounts.length} cuentas`,
      icon: "business-outline",
      color: themeColors.warning,
      onPress: () => navigation.navigate("BankAccounts"),
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
  ];

  const activeObjectives = objectives.filter((o) => o.status === "ACTIVO");
  const totalBankBalance = bankAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0,
  );
  const totalCashBalance = cashBalances.reduce(
    (sum, b) => sum + Number(b.balance),
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={
              bankAccountsQuery.isRefetching ||
              objectivesQuery.isRefetching ||
              cashBalancesQuery.isRefetching ||
              dailyReportQuery.isRefetching
            }
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

        <View style={styles.statsGrid}>
          <ScaleIn delay={100}>
            <StatsCard
              title="Total Banco"
              value={`$ ${formatNumber(totalBankBalance)}`}
              icon={
                <Ionicons
                  name="card"
                  size={20}
                  color={themeColors.primary[500]}
                />
              }
              color={themeColors.primary[500]}
              style={styles.statCard}
            />
          </ScaleIn>
          <ScaleIn delay={150}>
            <StatsCard
              title="Total Caja"
              value={`$ ${formatNumber(totalCashBalance)}`}
              icon={
                <Ionicons name="wallet" size={20} color={themeColors.success} />
              }
              color={themeColors.success}
              style={styles.statCard}
            />
          </ScaleIn>
        </View>

        {dailyReport && (
          <FadeInDown delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen del Día</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons
                      name="trending-up"
                      size={20}
                      color={themeColors.success}
                    />
                    <Text style={styles.summaryLabel}>Ganancia</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: themeColors.success },
                      ]}
                    >
                      $ {formatNumber(safeDailyReport.profit.net)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Ionicons
                      name="swap-horizontal"
                      size={20}
                      color={themeColors.primary[500]}
                    />
                    <Text style={styles.summaryLabel}>Transacciones</Text>
                    <Text style={styles.summaryValue}>
                      {safeDailyReport.transactions.total}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </FadeInDown>
        )}

        {activeObjectives.length > 0 && (
          <FadeInDown delay={250}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Objetivos Activos</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.objectivesScroll}
              >
                {activeObjectives.slice(0, 3).map((objective, index) => (
                  <ScaleIn key={objective.id} delay={300 + index * 50}>
                    <View style={styles.objectiveCard}>
                      <CircularProgress
                        percentage={objective.percentage}
                        size={60}
                        strokeWidth={5}
                        color={
                          objective.percentage >= 100
                            ? themeColors.success
                            : themeColors.primary[500]
                        }
                      >
                        <Text style={styles.objectivePercent}>
                          {objective.percentage.toFixed(0)}%
                        </Text>
                      </CircularProgress>
                      <Text style={styles.objectiveName} numberOfLines={1}>
                        {objective.name}
                      </Text>
                      <Text style={styles.objectiveAmount}>
                        {formatNumber(objective.currentAmount)} /{" "}
                        {formatNumber(objective.targetAmount)}
                      </Text>
                    </View>
                  </ScaleIn>
                ))}
              </ScrollView>
            </View>
          </FadeInDown>
        )}

        {/* {bankAccounts.length > 0 && (
          <FadeInDown delay={300}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cuentas Bancarias</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              {bankAccounts.slice(0, 2).map((account, index) => (
                <View key={account.id} style={styles.accountCard}>
                  <View style={styles.accountIcon}>
                    <Ionicons name="business" size={20} color={themeColors.primary[500]} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBank}>{account.bankName}</Text>
                  </View>
                  <View style={styles.accountBalance}>
                    <Text style={styles.balanceLabel}>Saldo</Text>
                    <Text style={styles.balanceValue}>$ {formatNumber(account.balance)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </FadeInDown>
        )} */}

        <FadeInDown delay={350}>
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
                    setCurrentPassword("");
                    setNewPassword("");
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

        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={{ color: themeColors.danger }}
        />

      </ScrollView>
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
    statsGrid: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: themeColors.text.primary,
      marginBottom: spacing.sm,
    },
    seeAll: {
      fontSize: 14,
      color: themeColors.primary[500],
      fontWeight: "500",
    },
    summaryCard: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...themeShadows.sm,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 12,
      color: themeColors.text.secondary,
      marginTop: spacing.xs,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: "700",
      color: themeColors.text.primary,
      marginTop: 4,
    },
    summaryDivider: {
      width: 1,
      height: 50,
      backgroundColor: themeColors.border,
    },
    objectivesScroll: {
      paddingRight: spacing.md,
      gap: spacing.md,
    },
    objectiveCard: {
      width: 140,
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: "center",
      ...themeShadows.sm,
    },
    objectivePercent: {
      fontSize: 12,
      fontWeight: "700",
      color: themeColors.text.primary,
    },
    objectiveName: {
      fontSize: 13,
      fontWeight: "600",
      color: themeColors.text.primary,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    objectiveAmount: {
      fontSize: 11,
      color: themeColors.text.secondary,
      marginTop: 4,
      textAlign: "center",
    },
    accountCard: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
      ...themeShadows.sm,
    },
    accountIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.primary[50],
      justifyContent: "center",
      alignItems: "center",
    },
    accountInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    accountName: {
      fontSize: 15,
      fontWeight: "600",
      color: themeColors.text.primary,
    },
    accountBank: {
      fontSize: 12,
      color: themeColors.text.secondary,
      marginTop: 2,
    },
    accountBalance: {
      alignItems: "flex-end",
    },
    balanceLabel: {
      fontSize: 11,
      color: themeColors.text.tertiary,
    },
    balanceValue: {
      fontSize: 16,
      fontWeight: "700",
      color: themeColors.text.primary,
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
    passwordForm: {
      backgroundColor: themeColors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      ...themeShadows.sm,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: themeColors.text.primary,
      marginBottom: spacing.md,
    },
    formButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    logoutButton: {
      marginTop: spacing.md,
    },
  });
