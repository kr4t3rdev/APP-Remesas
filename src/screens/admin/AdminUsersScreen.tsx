import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdminHeader } from "../../components/admin/layout/AdminHeader";
import { AddUserFormModal } from "../../components/admin/AddUserFormModal";
import { SuccessModal } from "../../components/admin/SuccessModal";
import { ErrorModal } from "../../components/admin/ErrorModal";
import { AdminSuspendAccountModal } from "../../components/admin/AdminSuspendAccountModal";
import { AdminSuspendSuccessModal } from "../../components/admin/AdminSuspendSuccessModal";
import {
  useCreateAdminUserMutation,
  useAdminUsersQuery,
  useAdminUserControlActionMutation,
} from "../../modules/admin/application/useAdminMetrics";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type {
  AdminCreateUserRequest,
  User,
  AdminUserControlActionType,
  UserRole,
} from "../../types";
import { getApiErrorMessage } from "../../utils/apiError";
import { BREAKPOINTS, useResponsive } from "../../hooks/useResponsive";

const AVATAR_MOCK = "https://i.pravatar.cc/150";

export const AdminUsersScreen: React.FC = () => {
  const colors = useColors();
  const { width } = useResponsive();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    border: colors.border,
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  const usersQuery = useAdminUsersQuery();
  const createAdminUserMutation = useCreateAdminUserMutation();
  const userControlActionMutation = useAdminUserControlActionMutation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "active">("all");
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [suspendSuccessModalVisible, setSuspendSuccessModalVisible] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [successModalState, setSuccessModalState] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const [errorModalState, setErrorModalState] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const allUsers = usersQuery.data ?? [];

  const directoryStats = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter((u) => u.isActive && !u.isBanned).length;
    const admins = allUsers.filter((u) => u.role === "ADMIN").length;
    const blocked = allUsers.filter((u) => u.isBanned || !u.isActive).length;
    return { total, active, admins, blocked };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const base = allUsers.filter((user) => {
      const text = `${user.name} ${user.email}`.toLowerCase();
      const matchesSearch = text.includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "active") return !!user.isActive && !user.isBanned;
      if (filter === "admin") return user.role === "ADMIN";
      return true;
    });
    return base;
  }, [allUsers, search, filter]);

  const handleCreateUser = async (input: AdminCreateUserRequest) => {
    try {
      await createAdminUserMutation.mutateAsync(input);
      setIsAddUserModalVisible(false);
      setSuccessModalState({
        visible: true,
        title: "Usuario creado",
        message: "El usuario ha sido creado correctamente",
      });
    } catch (error: unknown) {
      setErrorModalState({
        visible: true,
        title: "Error",
        message: getApiErrorMessage(error, "No se pudo crear el usuario"),
      });
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    try {
      await userControlActionMutation.mutateAsync({
        userId: selectedUser.id,
        request: { actionType: "SUSPEND_ACCOUNT", reason: "Admin Action" },
      });
      setSuspendModalVisible(false);
      setSuspendSuccessModalVisible(true);
    } catch (error: unknown) {
      setErrorModalState({
        visible: true,
        title: "Error",
        message: getApiErrorMessage(error, "No se pudo suspender el usuario"),
      });
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isOnline = item.isActive && !item.isBanned;
    const statusColor = item.isBanned
      ? theme.danger
      : isOnline
        ? theme.success
        : theme.textSecondary;
    const statusLabel = item.isBanned
      ? "BANNED"
      : !item.isActive
        ? "INACTIVE"
        : "ACTIVE";

    const roleLabel =
      item.role === "ADMIN"
        ? "ADMIN"
        : item.role === "USER"
          ? "USER"
          : (item.role as string);

    return (
      <TouchableOpacity
        testID={`admin-user-row-${item.id}`}
        style={styles.row}
        onPress={() => navigation.navigate("AdminUserDetail", { user: item })}
        activeOpacity={0.6}
      >
        <Text style={styles.rowId}>#{item.id}</Text>
        <View style={styles.rowUserCell}>
          <View style={styles.rowAvatarCell}>
            <Image
              source={{ uri: `${AVATAR_MOCK}?u=${item.id}` }}
              style={styles.rowAvatar}
            />
            <View
              style={[
                styles.rowStatusDot,
                { backgroundColor: statusColor },
              ]}
            />
          </View>
          <View style={styles.rowTextCell}>
            <Text style={styles.rowName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.rowEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.rowRoleBadge,
            item.role === "ADMIN"
              ? { backgroundColor: `${theme.primary}22` }
              : { backgroundColor: `${theme.textSecondary}22` },
          ]}
        >
          <Text
            style={[
              styles.rowRoleText,
              {
                color:
                  item.role === "ADMIN" ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            {roleLabel}
          </Text>
        </View>
        <View style={styles.rowStatusCell}>
          <View
            style={[
              styles.rowStatusPill,
              { borderColor: statusColor },
            ]}
          >
            <Text style={[styles.rowStatusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Feather
          name="chevron-right"
          size={16}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle={
          colors.background === "#0F172A" ? "light-content" : "dark-content"
        }
        backgroundColor={theme.background}
      />

      <AdminHeader
        title="Gestión de Usuarios"
        onRefresh={() => usersQuery.refetch()}
      />

      <View style={[styles.content, isWebDesktop && styles.webContent]}>
        {/* KPI strip — console directory metrics */}
        <View style={styles.kpiStrip}>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>TOTAL</Text>
            <Text style={styles.kpiValue}>{directoryStats.total}</Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>ACTIVOS</Text>
            <Text style={[styles.kpiValue, { color: theme.success }]}>
              {directoryStats.active}
            </Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>ADMINS</Text>
            <Text style={styles.kpiValue}>{directoryStats.admins}</Text>
          </View>
          <View style={[styles.kpiCell, { borderRightWidth: 0 }]}>
            <Text style={styles.kpiLabel}>BLOQUEADOS</Text>
            <Text style={[styles.kpiValue, { color: theme.danger }]}>
              {directoryStats.blocked}
            </Text>
          </View>
        </View>

        {/* Toolbar: search + segments + add user */}
        <View style={styles.toolbar}>
          <View style={styles.searchField}>
            <Feather
              name="search"
              size={16}
              color={theme.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o correo"
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.segments}>
            {(["all", "admin", "active"] as const).map((key) => {
              const label =
                key === "all"
                  ? "Todos"
                  : key === "admin"
                    ? "Admin"
                    : "Activos";
              const active = filter === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setFilter(key)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Table header — column labels */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.tableHeaderId]}>
            ID
          </Text>
          <Text
            style={[styles.tableHeaderCell, styles.tableHeaderUser]}
          >
            USUARIO
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableHeaderRole]}>
            ROL
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableHeaderStatus]}>
            ESTADO
          </Text>
          <View style={styles.tableHeaderChevron} />
        </View>

        <View style={styles.tableHeaderMeta}>
          <Text style={styles.tableHeaderMetaText}>
            USUARIOS REGISTRADOS
          </Text>
          <Text style={styles.tableHeaderMetaCount}>
            {filteredUsers.length} MOSTRADOS · {directoryStats.total} TOTAL
          </Text>
        </View>

        {/* Users list — dense rows */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            </View>
          }
        />
      </View>

      {/* Bottom CTA — compact pill (console) */}
      <TouchableOpacity
        testID="admin-add-user-bottom-cta"
        accessibilityLabel="Add user"
        style={styles.bottomCta}
        onPress={() => setIsAddUserModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="user-plus" size={14} color="#fff" />
        <Text style={styles.bottomCtaText}>Add user</Text>
      </TouchableOpacity>

      {/* Add User Modal */}
      <AddUserFormModal
        visible={isAddUserModalVisible}
        loading={createAdminUserMutation.isPending}
        onCancel={() => setIsAddUserModalVisible(false)}
        onSubmit={handleCreateUser}
      />

      <SuccessModal
        visible={successModalState.visible}
        title={successModalState.title}
        message={successModalState.message}
        onClose={() =>
          setSuccessModalState((prev) => ({ ...prev, visible: false }))
        }
      />

      <ErrorModal
        visible={errorModalState.visible}
        title={errorModalState.title}
        message={errorModalState.message}
        onCancel={() =>
          setErrorModalState((prev) => ({ ...prev, visible: false }))
        }
      />

      <AdminSuspendAccountModal
        visible={suspendModalVisible}
        user={selectedUser}
        loading={userControlActionMutation.isPending}
        onClose={() => setSuspendModalVisible(false)}
        onConfirm={handleSuspendUser}
      />

      <AdminSuspendSuccessModal
        visible={suspendSuccessModalVisible}
        user={selectedUser}
        onGoToList={() => {
          setSuspendSuccessModalVisible(false);
          setSelectedUser(null);
          usersQuery.refetch();
        }}
        onGoToDashboard={() => {
          setSuspendSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    webContent: {
      width: "100%",
      maxWidth: 1440,
      alignSelf: "center",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    kpiStrip: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.border,
      marginBottom: spacing.md,
    },
    kpiCell: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      borderRightWidth: 1,
      borderRightColor: theme.border,
      gap: 4,
    },
    kpiLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      color: theme.textSecondary,
    },
    kpiValue: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
      fontVariant: ["tabular-nums"],
    },
    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    searchField: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      height: 36,
      flex: 1,
    },
    searchIcon: {
      marginRight: 6,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 13,
      height: "100%",
      paddingVertical: 0,
    },
    segments: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      overflow: "hidden",
    },
    segment: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRightWidth: 1,
      borderRightColor: theme.border,
    },
    segmentActive: {
      backgroundColor: theme.primary,
    },
    segmentText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    segmentTextActive: {
      color: "#fff",
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: spacing.sm,
    },
    tableHeaderCell: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      color: theme.textSecondary,
    },
    tableHeaderId: {
      width: 48,
      fontVariant: ["tabular-nums"],
    },
    tableHeaderUser: {
      flex: 1,
    },
    tableHeaderRole: {
      width: 72,
      textAlign: "center",
    },
    tableHeaderStatus: {
      width: 92,
      textAlign: "center",
    },
    tableHeaderChevron: {
      width: 16,
    },
    tableHeaderMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    tableHeaderMetaText: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      color: theme.textSecondary,
    },
    tableHeaderMetaCount: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1,
      color: theme.textSecondary,
      fontVariant: ["tabular-nums"],
    },
    listContent: {
      paddingBottom: spacing.xxl,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: spacing.sm,
    },
    rowId: {
      width: 48,
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSecondary,
      fontVariant: ["tabular-nums"],
    },
    rowUserCell: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    rowAvatarCell: {
      position: "relative",
    },
    rowAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.border,
    },
    rowStatusDot: {
      position: "absolute",
      bottom: -1,
      right: -1,
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.card,
    },
    rowTextCell: {
      flex: 1,
    },
    rowName: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    rowEmail: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 1,
    },
    rowRoleBadge: {
      width: 64,
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderRadius: 4,
      alignItems: "center",
    },
    rowRoleText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    rowStatusCell: {
      width: 92,
      alignItems: "center",
    },
    rowStatusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1,
    },
    rowStatusText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
      fontVariant: ["tabular-nums"],
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: "center",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    bottomCta: {
      position: "absolute",
      bottom: spacing.lg,
      right: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 100,
    },
    bottomCtaText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
  });
