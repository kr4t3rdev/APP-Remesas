import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  Switch,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";
import type { User, AdminUserControlActionType } from "../../types";
import {
  useAdminUserControlActionMutation,
  useAdminUpdateUserBasicMutation,
  useAdminUserDetailQuery,
  useAdminDeleteUserMutation,
} from "../../modules/admin/application/useAdminMetrics";
import { AdminActionConfirmModal } from "../../components/admin/AdminActionConfirmModal";
import { SuccessModal } from "../../components/admin/SuccessModal";
import { ErrorModal } from "../../components/admin/ErrorModal";
import { AdminTempBlockModal } from "../../components/admin/AdminTempBlockModal";
import { AdminTempBlockSuccessModal } from "../../components/admin/AdminTempBlockSuccessModal";
import { AdminSuspendAccountModal } from "../../components/admin/AdminSuspendAccountModal";
import { AdminSuspendSuccessModal } from "../../components/admin/AdminSuspendSuccessModal";
import { AdminChangeRoleModal } from "../../components/admin/AdminChangeRoleModal";
import { AdminRoleChangeSuccessModal } from "../../components/admin/AdminRoleChangeSuccessModal";
import { AdminDeleteConfirmModal } from "../../components/admin/AdminDeleteConfirmModal";
import { Input } from "../../components/ui/Input";
import { DeleteButton } from "../../components/ui/DeleteButton";

const AVATAR_MOCK = "https://i.pravatar.cc/150";
const SCREEN_WIDTH = Dimensions.get("window").width;

type AdminUserDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "AdminUserDetail"
>;

export const AdminUserDetailScreen: React.FC = () => {
  const route = useRoute<AdminUserDetailScreenRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = route.params;
  const colors = useColors();

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

  // Mutations
  const userControlActionMutation = useAdminUserControlActionMutation();
  const updateUserBasicMutation = useAdminUpdateUserBasicMutation();
  const deleteUserMutation = useAdminDeleteUserMutation();

  // Query full user details (including license info)
  const { data: fullUser, isLoading: isLoadingUser } = useAdminUserDetailQuery(
    user.id,
  );

  // Use full user data if available, otherwise fallback to route params
  const displayUser = fullUser || user;

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  });

  // State for Modals
  const [confirmModalState, setConfirmModalState] = useState<{
    visible: boolean;
    actionType: AdminUserControlActionType | null;
    title: string;
    message: string;
  }>({
    visible: false,
    actionType: null,
    title: "",
    message: "",
  });

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

  // Specialized Modals State
  const [isTempBlockModalVisible, setIsTempBlockModalVisible] = useState(false);
  const [isTempBlockSuccessVisible, setIsTempBlockSuccessVisible] =
    useState(false);
  const [isSuspendAccountModalVisible, setIsSuspendAccountModalVisible] =
    useState(false);
  const [isSuspendSuccessVisible, setIsSuspendSuccessVisible] = useState(false);
  const [isChangeRoleModalVisible, setIsChangeRoleModalVisible] =
    useState(false);
  const [successRole, setSuccessRole] = useState<string | null>(null);
  const [tempBlockMode, setTempBlockMode] = useState<"BLOCK" | "UNBLOCK">(
    "BLOCK",
  );
  const [suspendMode, setSuspendMode] = useState<"SUSPEND" | "ACTIVATE">(
    "SUSPEND",
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserBasicMutation.mutateAsync({
        userId: user.id,
        name: editForm.name,
        email: editForm.email,
        isActive: editForm.isActive || false,
      });

      setIsEditing(false);
      setSuccessModalState({
        visible: true,
        title: "Profile Updated",
        message: "The user profile has been successfully updated.",
      });
    } catch (error) {
      setErrorModalState({
        visible: true,
        title: "Error",
        message: "Failed to update profile. Please try again.",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUserMutation.mutateAsync(user.id);
      setIsDeleteModalVisible(false);
      navigation.goBack();
    } catch (error) {
      setIsDeleteModalVisible(false);
      setErrorModalState({
        visible: true,
        title: "Error",
        message: "Failed to delete user. Please try again.",
      });
    }
  };

  const handleActionPress = (actionType: AdminUserControlActionType) => {
    switch (actionType) {
      case "TEMP_BLOCK":
        setTempBlockMode("BLOCK");
        setIsTempBlockModalVisible(true);
        break;
      case "UNBLOCK":
        setTempBlockMode("UNBLOCK");
        setIsTempBlockModalVisible(true);
        break;
      case "SUSPEND_ACCOUNT":
        setSuspendMode("SUSPEND");
        setIsSuspendAccountModalVisible(true);
        break;
      case "REACTIVATE_ACCOUNT":
        setSuspendMode("ACTIVATE");
        setIsSuspendAccountModalVisible(true);
        break;
      case "CHANGE_ROLE":
        setIsChangeRoleModalVisible(true);
        break;
      case "FORCE_PASSWORD_RESET":
        setConfirmModalState({
          visible: true,
          actionType: "FORCE_PASSWORD_RESET",
          title: "Force Password Reset",
          message: `Are you sure you want to force a password reset for ${user.name}? The user will receive an email with instructions.`,
        });
        break;
      case "REVOKE_ALL_SESSIONS":
        setConfirmModalState({
          visible: true,
          actionType: "REVOKE_ALL_SESSIONS",
          title: "Revoke All Sessions",
          message: `Are you sure you want to revoke all active sessions for ${user.name}? The user will need to log in again.`,
        });
        break;
      case "EXTEND_LICENSE":
        if (fullUser?.license?.id) {
          // Navigate to license detail if user has a license
          navigation.navigate("AdminLicenseDetail", {
            licenseId: fullUser.license.id,
          });
        } else {
          // Navigate to licenses list if no license assigned
          // Ideally pre-filter for this user or open "Assign License" flow
          navigation.navigate("AdminLicensesList");
        }
        break;
      default:
        console.warn("Unhandled action:", actionType);
    }
  };

  const executeAction = async (
    actionType: AdminUserControlActionType,
    additionalData?: any,
  ) => {
    try {
      // Construct the correct payload structure for AdminUserControlRequest
      const requestPayload: any = {};

      // Map specific fields based on action type
      if (actionType === "CHANGE_ROLE" && additionalData?.role) {
        requestPayload.newRole = additionalData.role;
      }

      if (actionType === "TEMP_BLOCK" && additionalData?.duration) {
        // Calculate blockUntil based on duration (hours)
        const blockUntilDate = new Date();
        blockUntilDate.setHours(
          blockUntilDate.getHours() + additionalData.duration,
        );
        requestPayload.blockUntil = blockUntilDate.toISOString();
      }

      // Default reason if not provided
      const reason =
        additionalData?.reason || "Action triggered from Admin User Detail";

      const mutationInput = {
        userId: user.id,
        request: {
          actionType,
          reason,
          payload:
            Object.keys(requestPayload).length > 0 ? requestPayload : undefined,
        },
      };

      await userControlActionMutation.mutateAsync(mutationInput);

      // Handle specific success modals based on action
      if (actionType === "TEMP_BLOCK" || actionType === "UNBLOCK") {
        setIsTempBlockModalVisible(false);
        setIsTempBlockSuccessVisible(true);
      } else if (
        actionType === "SUSPEND_ACCOUNT" ||
        actionType === "REACTIVATE_ACCOUNT"
      ) {
        setIsSuspendAccountModalVisible(false);
        setIsSuspendSuccessVisible(true);
      } else if (actionType === "CHANGE_ROLE") {
        setIsChangeRoleModalVisible(false);
        setSuccessRole(additionalData?.role);
      } else {
        setConfirmModalState((prev) => ({ ...prev, visible: false }));
        setSuccessModalState({
          visible: true,
          title: "Action Successful",
          message: "The action has been completed successfully.",
        });
      }
    } catch (error) {
      console.error("Error executing action:", error);
      setErrorModalState({
        visible: true,
        title: "Error",
        message: "Failed to execute action. Please try again.",
      });
    }
  };

  const renderActionCard = (
    title: string,
    subtitle: string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    actionType: AdminUserControlActionType | "MANAGE_LICENSE",
  ) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: theme.card }]}
      onPress={() =>
        handleActionPress(
          actionType === "MANAGE_LICENSE"
            ? ("EXTEND_LICENSE" as AdminUserControlActionType)
            : (actionType as AdminUserControlActionType),
        )
      }
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Determine dynamic action states
  const isTempBlocked =
    displayUser.blockedUntil && new Date(displayUser.blockedUntil) > new Date();
  const isSuspended = !displayUser.isActive;

  const getStatusColor = () => {
    if (displayUser.isActive === false) return theme.danger;
    if (isTempBlocked) return theme.warning;
    return displayUser.isActive ? theme.success : theme.textSecondary;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `${AVATAR_MOCK}?u=${displayUser.id}` }}
              style={styles.avatar}
            />
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: getStatusColor(),
                  borderColor: theme.background,
                },
              ]}
            />
          </View>

          <Text style={styles.userName}>{displayUser.name}</Text>
          <Text style={styles.userRole}>
            {displayUser.role === "ADMIN" ? "Administrator" : "User"}
          </Text>

          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: "#3B82F620" }]}>
              <Text style={[styles.badgeText, { color: "#60A5FA" }]}>
                ID: {displayUser.id}
              </Text>
            </View>

            {/* Status Badge with Priority: Suspended > Blocked > Active/Inactive */}
            {!displayUser.isActive ? (
              <View style={[styles.badge, { backgroundColor: "#EF444420" }]}>
                <Text style={[styles.badgeText, { color: "#F87171" }]}>
                  SUSPENDED
                </Text>
              </View>
            ) : isTempBlocked ? (
              <View style={[styles.badge, { backgroundColor: "#F59E0B20" }]}>
                <Text style={[styles.badgeText, { color: "#FBBF24" }]}>
                  BLOCKED
                </Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: "#10B98120" }]}>
                <Text style={[styles.badgeText, { color: "#34D399" }]}>
                  ACTIVE
                </Text>
              </View>
            )}

            {/* License Status Badge */}
            {fullUser?.license && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      fullUser.license.state === "ACTIVE"
                        ? "#10B98120"
                        : "#F59E0B20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color:
                        fullUser.license.state === "ACTIVE"
                          ? "#34D399"
                          : "#F59E0B",
                    },
                  ]}
                >
                  {fullUser.license.state === "ACTIVE"
                    ? "LICENSED"
                    : fullUser.license.state}
                </Text>
              </View>
            )}
          </View>

          {/* Edit Form */}
          {isEditing && (
            <View style={styles.editFormContainer}>
              <Input
                label="Name"
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, name: text })
                }
                placeholder="User Name"
                containerStyle={styles.inputContainer}
              />
              <Input
                label="Email"
                value={editForm.email}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, email: text })
                }
                placeholder="User Email"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.inputContainer}
              />

              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>
                  Active Status
                </Text>
                <Switch
                  value={editForm.isActive}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, isActive: value })
                  }
                  trackColor={{ false: theme.card, true: theme.success }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    {
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={[styles.editButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleSaveProfile}
                  disabled={updateUserBasicMutation.isPending}
                >
                  <Text style={[styles.editButtonText, { color: "#fff" }]}>
                    {updateUserBasicMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Primary Actions */}
          {!isEditing && (
            <View style={styles.primaryActions}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.card }]}
                onPress={() => setIsEditing(true)}
              >
                <Feather name="edit-2" size={20} color={theme.text} />
                <Text style={[styles.primaryButtonText, { color: theme.text }]}>
                  Edit Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Feather name="mail" size={20} color="#FFFFFF" />
                <Text style={[styles.primaryButtonText, { color: "#FFFFFF" }]}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Operational Actions Grid */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeader}>
            <Text style={styles.gridTitle}>Acciones Operativas</Text>
            <Text style={styles.gridSubtitle}>ADMIN CONTROL</Text>
          </View>

          <View style={styles.grid}>
            {/* Dynamic Block/Unblock Card */}
            {isTempBlocked
              ? renderActionCard(
                  "Unblock User",
                  "Restore access immediately",
                  "lock-open",
                  theme.success,
                  "UNBLOCK",
                )
              : renderActionCard(
                  "Temporary Block",
                  "Suspend access temporarily",
                  "ban",
                  "#F59E0B",
                  "TEMP_BLOCK",
                )}

            {/* Dynamic Suspend/Activate Card */}
            {isSuspended
              ? renderActionCard(
                  "Activate Account",
                  "Restore full access",
                  "checkmark-circle",
                  theme.success,
                  "REACTIVATE_ACCOUNT",
                )
              : renderActionCard(
                  "Suspend Account",
                  "Deactivate profile access",
                  "close-circle",
                  "#EF4444",
                  "SUSPEND_ACCOUNT",
                )}

            {renderActionCard(
              "Force Password Reset",
              "Trigger security reset",
              "refresh",
              "#3B82F6",
              "FORCE_PASSWORD_RESET",
            )}
            {renderActionCard(
              "Revoke Sessions",
              "Log out everywhere",
              "log-out",
              "#94A3B8",
              "REVOKE_ALL_SESSIONS",
            )}
            {renderActionCard(
              "Change Role",
              "Update permissions",
              "person-circle",
              "#8B5CF6",
              "CHANGE_ROLE",
            )}
            {renderActionCard(
              "Manage License",
              "Edit billing & seats",
              "card",
              "#3B82F6",
              "MANAGE_LICENSE",
            )}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeader}>
            <Text style={[styles.gridTitle, { color: theme.danger }]}>
              Danger Zone
            </Text>
            <Text style={styles.gridSubtitle}>PERMANENT ACTIONS</Text>
          </View>
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <DeleteButton
              label="Delete User"
              onPress={() => setIsDeleteModalVisible(true)}
              style={{ width: "100%" }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <AdminActionConfirmModal
        visible={confirmModalState.visible}
        actionType={confirmModalState.actionType}
        onConfirm={() =>
          confirmModalState.actionType &&
          executeAction(confirmModalState.actionType)
        }
        onCancel={() =>
          setConfirmModalState((prev) => ({ ...prev, visible: false }))
        }
        loading={userControlActionMutation.isPending}
      />

      <AdminTempBlockModal
        visible={isTempBlockModalVisible}
        user={user}
        mode={tempBlockMode}
        onClose={() => setIsTempBlockModalVisible(false)}
        onConfirm={() =>
          executeAction(
            tempBlockMode === "UNBLOCK" ? "UNBLOCK" : "TEMP_BLOCK",
            {
              duration: tempBlockMode === "UNBLOCK" ? 0 : 24,
              reason:
                tempBlockMode === "UNBLOCK" ? "Manual Unblock" : "Manual Block",
            },
          )
        }
        loading={userControlActionMutation.isPending}
      />

      <AdminTempBlockSuccessModal
        visible={isTempBlockSuccessVisible}
        user={user}
        mode={tempBlockMode}
        onBackToProfile={() => setIsTempBlockSuccessVisible(false)}
        onGoToDashboard={() => {
          setIsTempBlockSuccessVisible(false);
          navigation.navigate("Main");
        }}
      />

      <AdminSuspendAccountModal
        visible={isSuspendAccountModalVisible}
        user={user}
        mode={suspendMode}
        onClose={() => setIsSuspendAccountModalVisible(false)}
        onConfirm={() =>
          executeAction(
            suspendMode === "SUSPEND"
              ? "SUSPEND_ACCOUNT"
              : "REACTIVATE_ACCOUNT",
            {
              reason:
                suspendMode === "SUSPEND"
                  ? "Manual Suspension"
                  : "Manual Reactivation",
            },
          )
        }
        loading={userControlActionMutation.isPending}
      />

      <AdminSuspendSuccessModal
        visible={isSuspendSuccessVisible}
        user={user}
        mode={suspendMode}
        onGoToList={() => setIsSuspendSuccessVisible(false)}
        onGoToDashboard={() => {
          setIsSuspendSuccessVisible(false);
          navigation.navigate("Main");
        }}
      />

      <AdminChangeRoleModal
        visible={isChangeRoleModalVisible}
        user={user}
        onClose={() => setIsChangeRoleModalVisible(false)}
        onConfirm={(newRole) => executeAction("CHANGE_ROLE", { role: newRole })}
        loading={userControlActionMutation.isPending}
      />

      <AdminRoleChangeSuccessModal
        visible={!!successRole}
        user={user}
        newRole={successRole || ""}
        onBackToProfile={() => setSuccessRole(null)}
        onGoToDashboard={() => {
          setSuccessRole(null);
          navigation.navigate("Main");
        }}
      />

      <AdminDeleteConfirmModal
        visible={isDeleteModalVisible}
        userName={user.name}
        onConfirm={handleDeleteUser}
        onCancel={() => setIsDeleteModalVisible(false)}
        loading={deleteUserMutation.isPending}
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
        onClose={() =>
          setErrorModalState((prev) => ({ ...prev, visible: false }))
        }
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    menuButton: {
      padding: spacing.xs,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    profileSection: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: spacing.md,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: theme.card,
    },
    statusIndicator: {
      position: "absolute",
      bottom: 5,
      right: 5,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 3,
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: spacing.xs,
    },
    userRole: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: spacing.md,
    },
    badgesContainer: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    badge: {
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    primaryActions: {
      flexDirection: "row",
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      width: "100%",
    },
    primaryButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 24,
      gap: spacing.sm,
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    editFormContainer: {
      width: "100%",
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    inputContainer: {
      marginBottom: spacing.xs,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: "500",
    },
    editActions: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    editButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    gridSection: {
      padding: spacing.lg,
    },
    gridHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    gridTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    gridSubtitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    actionCard: {
      width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
      padding: spacing.lg,
      borderRadius: 20,
      gap: spacing.md,
      minHeight: 160,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xs,
    },
    actionContent: {
      gap: 4,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    actionSubtitle: {
      fontSize: 12,
    },
  });
