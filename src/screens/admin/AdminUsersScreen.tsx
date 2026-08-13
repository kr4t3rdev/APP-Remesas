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
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdminHeader } from "../../components/admin/layout/AdminHeader";
import { FadeInDown } from "../../components/animations";
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

// Mock avatar images for demo purposes (replace with real user avatars if available)
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

  const filteredUsers = useMemo(() => {
    const base = (usersQuery.data ?? []).filter((user) => {
      const text = `${user.name} ${user.email}`.toLowerCase();
      const matchesSearch = text.includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "active") return !!user.isActive && !user.isBanned;
      if (filter === "admin") return user.role === "ADMIN";
      return true;
    });
    return base;
  }, [usersQuery.data, search, filter]);

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

  const renderUserItem = ({ item, index }: { item: User; index: number }) => {
    // Determine status color
    const isOnline = item.isActive && !item.isBanned;
    const statusColor = item.isBanned
      ? theme.danger
      : isOnline
        ? theme.success
        : theme.textSecondary;

    // Determine role badge style
    let roleBadgeStyle = styles.roleBadgeDefault;
    let roleTextStyle = styles.roleTextDefault;
    let roleLabel = item.role as string;

    if (item.role === "ADMIN") {
      roleBadgeStyle = styles.roleBadgeAdmin;
      roleTextStyle = styles.roleTextAdmin;
      roleLabel = "ADMINISTRADOR";
    } else if (!item.isActive) {
      roleBadgeStyle = styles.roleBadgeInactive;
      roleTextStyle = styles.roleTextInactive;
      roleLabel = "INACTIVO";
    } else {
      roleLabel = item.role === "USER" ? "VISUALIZADOR" : item.role;
    }

    return (
      <FadeInDown delay={index * 50} duration={400}>
        <TouchableOpacity
          testID={`admin-user-row-${item.id}`}
          style={styles.userCard}
          onPress={() => navigation.navigate("AdminUserDetail", { user: item })}
          activeOpacity={0.7}
        >
          <View style={styles.userInfoRow}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: `${AVATAR_MOCK}?u=${item.id}` }}
                style={styles.avatarImage}
              />
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
            </View>

            {/* Info Section */}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>

              <View style={styles.badgesRow}>
                <View style={[styles.roleBadge, roleBadgeStyle]}>
                  <Text style={[styles.roleText, roleTextStyle]}>
                    {roleLabel}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Menu - Now Chevron */}
            <View style={styles.menuButton}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.textSecondary}
              />
            </View>
          </View>
        </TouchableOpacity>
      </FadeInDown>
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

      {/* Header */}
      <AdminHeader
        title="Gestión de Usuarios"
        onRefresh={() => usersQuery.refetch()}
      />

      {/* Floating Action Button for Add User - Replacing Header Button */}
      <TouchableOpacity
        testID="admin-add-user-bottom-cta"
        accessibilityLabel="Add user"
        style={styles.floatingAddButton}
        onPress={() => setIsAddUserModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={[styles.content, isWebDesktop && styles.webContent]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
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

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "all" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "admin" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("admin")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "admin" && styles.filterTextActive,
              ]}
            >
              Admin
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={filter === "admin" ? "#fff" : theme.textSecondary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "active" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("active")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "active" && styles.filterTextActive,
              ]}
            >
              Activos
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={filter === "active" ? "#fff" : theme.textSecondary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* List Header */}
        <View style={[styles.listHeader, isWebDesktop && styles.webListHeader]}>
          <Text style={styles.listTitle}>Usuarios Registrados</Text>
          <Text style={styles.listCount}>{filteredUsers.length} USUARIOS</Text>
        </View>

        {/* Users List */}
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

      {/* Add User Modal */}
      <AddUserFormModal
        visible={isAddUserModalVisible}
        loading={createAdminUserMutation.isPending}
        onCancel={() => setIsAddUserModalVisible(false)}
        onSubmit={handleCreateUser}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={successModalState.visible}
        title={successModalState.title}
        message={successModalState.message}
        onClose={() =>
          setSuccessModalState((prev) => ({ ...prev, visible: false }))
        }
      />

      {/* Error Modal */}
      <ErrorModal
        visible={errorModalState.visible}
        title={errorModalState.title}
        message={errorModalState.message}
        onCancel={() =>
          setErrorModalState((prev) => ({ ...prev, visible: false }))
        }
      />

      {/* Suspend User Modal */}
      <AdminSuspendAccountModal
        visible={suspendModalVisible}
        user={selectedUser}
        loading={userControlActionMutation.isPending}
        onClose={() => setSuspendModalVisible(false)}
        onConfirm={handleSuspendUser}
      />

      {/* Suspend Success Modal */}
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
    floatingAddButton: {
      position: "absolute",
      bottom: spacing.xl,
      right: spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center",
    },
    addButton: {
      backgroundColor: `${theme.primary}20`,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      height: 50,
      marginBottom: spacing.md,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
      height: "100%",
    },
    filtersContainer: {
      flexDirection: "row",
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    filterPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: "transparent",
    },
    filterPillActive: {
      backgroundColor: theme.primary,
    },
    filterText: {
      color: theme.textSecondary,
      fontWeight: "600",
      fontSize: 14,
    },
    filterTextActive: {
      color: "#fff",
    },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    webListHeader: { marginTop: spacing.sm, marginBottom: spacing.lg },
    listTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    listCount: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    userCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    userInfoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarContainer: {
      position: "relative",
      marginRight: spacing.md,
    },
    avatarImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.border,
    },
    statusDot: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: theme.card,
    },
    userDetails: {
      flex: 1,
      justifyContent: "center",
    },
    userName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    badgesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    roleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: "transparent",
    },
    roleBadgeAdmin: {
      backgroundColor: `${theme.primary}20`,
    },
    roleBadgeInactive: {
      backgroundColor: `${theme.danger}20`,
    },
    roleBadgeDefault: {
      backgroundColor: `${theme.textSecondary}20`,
    },
    roleText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    roleTextAdmin: {
      color: theme.primary,
    },
    roleTextInactive: {
      color: theme.danger,
    },
    roleTextDefault: {
      color: theme.textSecondary,
    },
    menuButton: {
      padding: 4,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: "center",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 16,
    },
  });
