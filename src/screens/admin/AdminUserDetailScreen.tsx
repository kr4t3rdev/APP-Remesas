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
  Platform,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";
import type { User, AdminUserDetail, AdminUserControlActionType } from "../../types";
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
import { AdminResetPasswordModal } from "../../components/admin/AdminResetPasswordModal";
import { AdminResetPasswordSuccessModal } from "../../components/admin/AdminResetPasswordSuccessModal";
import { Input } from "../../components/ui/Input";
import { DeleteButton } from "../../components/ui/DeleteButton";
import { BREAKPOINTS } from "../../hooks/useResponsive";

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
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

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

  const userControlActionMutation = useAdminUserControlActionMutation();
  const updateUserBasicMutation = useAdminUpdateUserBasicMutation();
  const deleteUserMutation = useAdminDeleteUserMutation();

  const { data: fullUser, isLoading: isLoadingUser } = useAdminUserDetailQuery(
    user.id,
  );

  const displayUser = fullUser || user;
  const safeLicense = (displayUser as AdminUserDetail).license ?? null;

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  });

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
  const [isResetPasswordModalVisible, setIsResetPasswordModalVisible] =
    useState(false);
  const [isResetPasswordSuccessVisible, setIsResetPasswordSuccessVisible] =
    useState(false);
  const [resetPasswordUserEmail, setResetPasswordUserEmail] = useState("");

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
      case "RESET_PASSWORD":
        setIsResetPasswordModalVisible(true);
        break;
      case "EXTEND_LICENSE":
        if (safeLicense?.id) {
          navigation.navigate("AdminLicenseDetail", {
            licenseId: safeLicense.id,
          });
        } else {
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
      const requestPayload: any = {};

      if (actionType === "CHANGE_ROLE" && additionalData?.role) {
        requestPayload.newRole = additionalData.role;
      }

      if (actionType === "TEMP_BLOCK" && additionalData?.duration) {
        const blockUntilDate = new Date();
        blockUntilDate.setHours(
          blockUntilDate.getHours() + additionalData.duration,
        );
        requestPayload.blockUntil = blockUntilDate.toISOString();
      }

      if (actionType === "RESET_PASSWORD" && additionalData?.newPassword) {
        requestPayload.newPassword = additionalData.newPassword;
      }

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
      } else if (actionType === "RESET_PASSWORD") {
        setIsResetPasswordModalVisible(false);
        setResetPasswordUserEmail(displayUser.email);
        setIsResetPasswordSuccessVisible(true);
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

  const isTempBlocked =
    displayUser.blockedUntil && new Date(displayUser.blockedUntil) > new Date();
  const isSuspended = !displayUser.isActive;

  const getStatusColor = () => {
    if (displayUser.isActive === false) return theme.danger;
    if (isTempBlocked) return theme.warning;
    return displayUser.isActive ? theme.success : theme.textSecondary;
  };

  const renderActionRow = (
    title: string,
    subtitle: string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    actionType: AdminUserControlActionType | "MANAGE_LICENSE",
    code: string,
  ) => (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={() =>
        handleActionPress(
          actionType === "MANAGE_LICENSE"
            ? ("EXTEND_LICENSE" as AdminUserControlActionType)
            : (actionType as AdminUserControlActionType),
        )
      }
      activeOpacity={0.6}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.actionCode}>{code}</Text>
      <Feather name="chevron-right" size={16} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const lastSeenLabel = isTempBlocked
    ? "BLOCKED"
    : isSuspended
      ? "SUSPENDED"
      : displayUser.isActive
        ? "ACTIVE"
        : "INACTIVE";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle={
          colors.background === "#0F172A" ? "light-content" : "dark-content"
        }
        backgroundColor={theme.background}
      />

      {/* Compact header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerMain}>
          <Text style={styles.headerTitle}>User Profile</Text>
          <Text style={styles.headerMeta}>
            ADMIN · USER DETAIL · #{displayUser.id}
          </Text>
        </View>
        {!isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-2" size={14} color={theme.text} />
              <Text style={styles.headerActionText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerActionBtn, styles.headerActionBtnPrimary]}>
              <Feather name="mail" size={14} color="#FFFFFF" />
              <Text style={[styles.headerActionText, { color: "#FFFFFF" }]}>
                Message
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.headerActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerActionBtn, styles.headerActionBtnPrimary]}
              onPress={handleSaveProfile}
              disabled={updateUserBasicMutation.isPending}
            >
              <Text
                style={[styles.headerActionText, { color: "#FFFFFF" }]}
              >
                {updateUserBasicMutation.isPending ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWebDesktop && styles.webScrollContent,
        ]}
      >
        {/* Identity row — compact, console-style */}
        <View style={styles.identityRow}>
          <View style={styles.identityAvatar}>
            <Image
              source={{ uri: `${AVATAR_MOCK}?u=${displayUser.id}` }}
              style={styles.identityAvatarImg}
            />
            <View
              style={[
                styles.identityStatusDot,
                {
                  backgroundColor: getStatusColor(),
                  borderColor: theme.background,
                },
              ]}
            />
          </View>
          <View style={styles.identityMain}>
            <View style={styles.identityTitleRow}>
              <Text style={styles.identityName}>{displayUser.name}</Text>
              <Text style={styles.identityRole}>
                {displayUser.role === "ADMIN" ? "Administrator" : "User"}
              </Text>
            </View>
            <Text style={styles.identityEmail}>{displayUser.email}</Text>
            <View style={styles.identityBadges}>
              <View style={[styles.badge, { backgroundColor: "#3B82F620" }]}>
                <Text style={[styles.badgeText, { color: "#60A5FA" }]}>
                  ID: {displayUser.id}
                </Text>
              </View>
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
              {safeLicense && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        safeLicense.state === "ACTIVE"
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
                          safeLicense.state === "ACTIVE"
                            ? "#34D399"
                            : "#F59E0B",
                      },
                    ]}
                  >
                    {safeLicense.state === "ACTIVE"
                      ? "LICENSED"
                      : safeLicense.state}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Edit form (inline) */}
        {isEditing && (
          <View style={styles.editPanel}>
            <Text style={styles.sectionMeta}>EDIT PROFILE</Text>
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
                trackColor={{ false: theme.border, true: theme.success }}
                thumbColor="#fff"
              />
            </View>
          </View>
        )}

        {/* KPI strip — console density */}
        <View style={styles.kpiStrip}>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>ID</Text>
            <Text style={styles.kpiValue}>#{displayUser.id}</Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>STATUS</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: getStatusColor(), fontVariant: ["tabular-nums"] },
              ]}
            >
              {lastSeenLabel}
            </Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>ROLE</Text>
            <Text style={styles.kpiValue}>
              {displayUser.role === "ADMIN" ? "ADMIN" : "USER"}
            </Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>LICENSE</Text>
            <Text style={styles.kpiValue}>
              {safeLicense ? safeLicense.state : "NONE"}
            </Text>
          </View>
          <View style={[styles.kpiCell, { borderRightWidth: 0 }]}>
            <Text style={styles.kpiLabel}>VERIFIED</Text>
            <Text style={styles.kpiValue}>
              {(displayUser as any).isVerified ? "YES" : "NO"}
            </Text>
          </View>
        </View>

        {/* Operational controls — dense rows */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>OPERATIONAL CONTROLS</Text>
            <Text style={styles.sectionCount}>8 ACTIONS</Text>
          </View>
          <View style={styles.rows}>
            {isTempBlocked
              ? renderActionRow(
                  "Unblock User",
                  "Restore access immediately",
                  "lock-open",
                  theme.success,
                  "UNBLOCK",
                  "UNBLOCK",
                )
              : renderActionRow(
                  "Temporary Block",
                  "Suspend access temporarily",
                  "ban",
                  "#F59E0B",
                  "TEMP_BLOCK",
                  "TEMP_BLOCK",
                )}

            {isSuspended
              ? renderActionRow(
                  "Activate Account",
                  "Restore full access",
                  "checkmark-circle",
                  theme.success,
                  "REACTIVATE_ACCOUNT",
                  "ACTIVATE",
                )
              : renderActionRow(
                  "Suspend Account",
                  "Deactivate profile access",
                  "close-circle",
                  "#EF4444",
                  "SUSPEND_ACCOUNT",
                  "SUSPEND",
                )}

            {renderActionRow(
              "Force Password Reset",
              "Trigger security reset",
              "refresh",
              "#3B82F6",
              "FORCE_PASSWORD_RESET",
              "FORCE_PWD",
            )}
            {renderActionRow(
              "Reset Password",
              "Change user password immediately",
              "key",
              "#3B82F6",
              "RESET_PASSWORD",
              "RESET_PWD",
            )}
            {renderActionRow(
              "Revoke Sessions",
              "Log out everywhere",
              "log-out",
              "#94A3B8",
              "REVOKE_ALL_SESSIONS",
              "REVOKE",
            )}
            {renderActionRow(
              "Change Role",
              "Update permissions",
              "person-circle",
              "#8B5CF6",
              "CHANGE_ROLE",
              "ROLE",
            )}
            {renderActionRow(
              "Manage License",
              "Edit billing & seats",
              "card",
              "#3B82F6",
              "MANAGE_LICENSE",
              "LICENSE",
            )}
          </View>
        </View>

        {/* Danger zone — dense row, danger accent */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.danger }]}>
              DANGER ZONE
            </Text>
            <Text style={styles.sectionCount}>PERMANENT</Text>
          </View>
          <TouchableOpacity
            style={[styles.actionRow, styles.dangerRow]}
            onPress={() => setIsDeleteModalVisible(true)}
            activeOpacity={0.6}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${theme.danger}22` },
              ]}
            >
              <Feather name="trash-2" size={16} color={theme.danger} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: theme.danger }]}>
                Delete User
              </Text>
              <Text style={styles.actionSubtitle}>
                Permanently remove this user and all associated data
              </Text>
            </View>
            <Text style={[styles.actionCode, { color: theme.danger }]}>
              DELETE
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
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
        onCancel={() =>
          setErrorModalState((prev) => ({ ...prev, visible: false }))
        }
      />

      <AdminResetPasswordModal
        visible={isResetPasswordModalVisible}
        user={user}
        onClose={() => setIsResetPasswordModalVisible(false)}
        onConfirm={(newPassword) =>
          executeAction("RESET_PASSWORD", { newPassword })
        }
        loading={userControlActionMutation.isPending}
      />

      <AdminResetPasswordSuccessModal
        visible={isResetPasswordSuccessVisible}
        userEmail={resetPasswordUserEmail}
        onBackToProfile={() => setIsResetPasswordSuccessVisible(false)}
        onGoToDashboard={() => {
          setIsResetPasswordSuccessVisible(false);
          navigation.navigate("Main");
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: spacing.sm,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerMain: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    headerMeta: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: "row",
      gap: 6,
    },
    headerActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    headerActionBtnPrimary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    headerActionText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
    },
    menuButton: {
      padding: spacing.xs,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    webScrollContent: {
      width: "100%",
      maxWidth: 1440,
      alignSelf: "center",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    identityRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    identityAvatar: {
      position: "relative",
    },
    identityAvatarImg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.border,
    },
    identityStatusDot: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
    },
    identityMain: {
      flex: 1,
    },
    identityTitleRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
    },
    identityName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    identityRole: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      color: theme.textSecondary,
    },
    identityEmail: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    identityBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: spacing.sm,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    editPanel: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionMeta: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      marginBottom: spacing.xs,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
      marginTop: spacing.xs,
    },
    switchLabel: {
      fontSize: 13,
      fontWeight: "500",
    },
    kpiStrip: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.border,
      marginTop: spacing.md,
      marginHorizontal: 0,
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
      fontSize: 13,
      fontWeight: "800",
      color: theme.text,
      fontVariant: ["tabular-nums"],
    },
    section: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: theme.textSecondary,
    },
    sectionCount: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      color: theme.textSecondary,
    },
    rows: {
      marginTop: 2,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: spacing.sm,
    },
    dangerRow: {
      backgroundColor: "transparent",
    },
    actionIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    actionText: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    actionSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 1,
    },
    actionCode: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      color: theme.textSecondary,
      minWidth: 64,
      textAlign: "right",
    },
  });
