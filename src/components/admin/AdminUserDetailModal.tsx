import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors, useShadows } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { User, AdminUserControlActionType } from "../../types";
import { UserControlActionCard } from "./UserControlActionCard";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

// Mock avatar for consistency
const AVATAR_MOCK = "https://i.pravatar.cc/150";

type AdminUserDetailModalProps = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onUpdateBasic: (
    userId: number,
    data: { name: string; email: string; isActive: boolean },
  ) => Promise<void>;
  onAction: (action: AdminUserControlActionType) => void;
  isUpdating?: boolean;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  visible,
  user,
  onClose,
  onUpdateBasic,
  onAction,
  isUpdating = false,
}) => {
  // Theme
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    border: colors.border,
  };

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Edit State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // Sync state when user changes
  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditIsActive(Boolean(user.isActive));
    }
  }, [user]);

  const handleSaveBasic = () => {
    if (!user) return;
    onUpdateBasic(user.id, {
      name: editName,
      email: editEmail,
      isActive: editIsActive,
    });
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          {/* Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header Profile */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: `${AVATAR_MOCK}?u=${user.id}` }}
                style={styles.avatar}
              />
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: user.isBanned
                      ? theme.danger
                      : user.isActive
                        ? theme.success
                        : theme.textSecondary,
                  },
                ]}
              >
                <Ionicons
                  name={
                    user.isBanned
                      ? "ban"
                      : user.isActive
                        ? "checkmark"
                        : "pause"
                  }
                  size={12}
                  color="#fff"
                />
              </View>
            </View>

            <View style={styles.headerInfo}>
              <Text style={[styles.name, { color: theme.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>
                {user.email}
              </Text>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      user.role === "ADMIN"
                        ? `${theme.primary}20`
                        : `${theme.textSecondary}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        user.role === "ADMIN"
                          ? theme.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {user.role === "ADMIN" ? "ADMINISTRADOR" : "USUARIO"}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "profile" && { borderBottomColor: theme.primary },
              ]}
              onPress={() => setActiveTab("profile")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "profile"
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                Perfil & Datos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "security" && {
                  borderBottomColor: theme.primary,
                },
              ]}
              onPress={() => setActiveTab("security")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "security"
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                Seguridad & Acciones
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {activeTab === "profile" ? (
              <View style={styles.section}>
                <View
                  style={[styles.inputGroup, { backgroundColor: theme.card }]}
                >
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Nombre Completo
                  </Text>
                  <Input
                    value={editName}
                    onChangeText={setEditName}
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      color: theme.text,
                      paddingHorizontal: 0,
                    }}
                    placeholderTextColor={theme.textSecondary}
                  />
                  <View
                    style={[styles.divider, { backgroundColor: theme.border }]}
                  />

                  <Text
                    style={[
                      styles.label,
                      { color: theme.textSecondary, marginTop: spacing.md },
                    ]}
                  >
                    Correo Electrónico
                  </Text>
                  <Input
                    value={editEmail}
                    onChangeText={setEditEmail}
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      color: theme.text,
                      paddingHorizontal: 0,
                    }}
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="none"
                  />
                </View>

                <View
                  style={[styles.toggleCard, { backgroundColor: theme.card }]}
                >
                  <View>
                    <Text style={[styles.toggleLabel, { color: theme.text }]}>
                      Estado de Cuenta
                    </Text>
                    <Text
                      style={[
                        styles.toggleSubLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {editIsActive
                        ? "El usuario puede iniciar sesión"
                        : "Acceso restringido temporalmente"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setEditIsActive(!editIsActive)}
                    style={[
                      styles.switch,
                      {
                        backgroundColor: editIsActive
                          ? theme.success
                          : theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        { transform: [{ translateX: editIsActive ? 20 : 2 }] },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <Button
                  title={isUpdating ? "Guardando..." : "Guardar Cambios"}
                  onPress={handleSaveBasic}
                  loading={isUpdating}
                  style={{
                    marginTop: spacing.lg,
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
            ) : (
              <View style={styles.section}>
                <Text
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
                >
                  Control de Acceso
                </Text>

                <View style={styles.actionsGrid}>
                  <ActionTile
                    icon="shield-checkmark-outline"
                    label="Cambiar Rol"
                    color={theme.primary}
                    onPress={() => onAction("CHANGE_ROLE")}
                  />
                  <ActionTile
                    icon="lock-closed-outline"
                    label="Bloquear"
                    color={theme.warning}
                    onPress={() => onAction("TEMP_BLOCK")}
                  />
                  <ActionTile
                    icon="key-outline"
                    label="Reset Pass"
                    color={theme.primary}
                    onPress={() => onAction("FORCE_PASSWORD_RESET")}
                  />
                  <ActionTile
                    icon="log-out-outline"
                    label="Cerrar Sesiones"
                    color={theme.textSecondary}
                    onPress={() => onAction("REVOKE_ALL_SESSIONS")}
                  />
                </View>

                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.textSecondary, marginTop: spacing.lg },
                  ]}
                >
                  Zona de Peligro
                </Text>
                <TouchableOpacity
                  style={[styles.dangerButton, { borderColor: theme.danger }]}
                  onPress={() => onAction("SUSPEND_ACCOUNT")}
                >
                  <MaterialCommunityIcons
                    name="account-cancel"
                    size={24}
                    color={theme.danger}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dangerTitle, { color: theme.danger }]}>
                      Suspender Cuenta
                    </Text>
                    <Text
                      style={[
                        styles.dangerDesc,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Inhabilita el acceso permanentemente hasta reactivación
                      manual.
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ActionTile = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity
    style={[
      styles.actionTile,
      { backgroundColor: `${color}15`, borderColor: `${color}30` },
    ]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#334155",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#334155",
  },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0F172A",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    padding: spacing.sm,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  toggleSubLabel: {
    fontSize: 12,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionTile: {
    flex: 1,
    minWidth: "30%",
    aspectRatio: 1.2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  actionLabel: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "600",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    gap: spacing.md,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  dangerDesc: {
    fontSize: 12,
  },
});
