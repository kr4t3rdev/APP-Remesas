import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { User } from "../../types";

const AVATAR_MOCK = "https://i.pravatar.cc/150";
const { width } = Dimensions.get("window");

type AdminResetPasswordModalProps = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export const AdminResetPasswordModal: React.FC<
  AdminResetPasswordModalProps
> = ({
  visible,
  user,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    danger: colors.danger,
    success: colors.success,
    border: colors.border,
  };

  if (!visible || !user) return null;

  const mainColor = theme.primary;
  const buttonColor = theme.primary;
  const iconName = "lock-reset";
  const title = "Reset Password";
  const cardTitle = "Confirm Password Reset";
  const confirmText = "Confirm Reset";

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Avatar with Badge */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `${AVATAR_MOCK}?u=${user.id}` }}
              style={styles.avatar}
            />
            <View style={[styles.warningBadge, { backgroundColor: mainColor }]}>
              <Ionicons name={iconName} size={16} color="#fff" />
            </View>
          </View>

          {/* User Info */}
          <Text style={[styles.userName, { color: theme.text }]}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user.email}
          </Text>
          <Text style={[styles.userId, { color: theme.textSecondary }]}>
            ID: {user.id} • {user.isActive ? "USUARIO ACTIVO" : "USUARIO INACTIVO"}
          </Text>

          {/* Warning Card */}
          <View
            style={[
              styles.warningCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={32}
                color={theme.primary}
              />
            </View>

            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {cardTitle}
            </Text>

            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Al confirmar esta acción, la contraseña del usuario será{" "}
              <Text style={{ color: theme.primary, fontWeight: "700" }}>
                resetada inmediatamente
              </Text>{" "}
              y recibirá un correo con sus credenciales temporales. El usuario
              deberá cambiar su contraseña en el próximo inicio de sesión.
            </Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                backgroundColor: buttonColor,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? "Resetting..." : confirmText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.card }]}
            onPress={onClose}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#F9FAFB",
  },
  warningBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  userId: {
    fontSize: 13,
    marginBottom: spacing.xl,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : spacing.lg,
    gap: spacing.md,
  },
  confirmButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
