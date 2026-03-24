import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { User } from "../../types";

const { width } = Dimensions.get("window");

type AdminTempBlockSuccessModalProps = {
  visible: boolean;
  user: User | null;
  mode?: "BLOCK" | "UNBLOCK";
  onBackToProfile: () => void;
  onGoToDashboard: () => void;
};

export const AdminTempBlockSuccessModal: React.FC<
  AdminTempBlockSuccessModalProps
> = ({ visible, user, mode = "BLOCK", onBackToProfile, onGoToDashboard }) => {
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
    border: colors.border,
  };

  if (!visible || !user) return null;

  const isBlock = mode === "BLOCK";
  const badgeText = isBlock ? "ACCIÓN COMPLETADA" : "DESBLOQUEO EXITOSO";
  const badgeColor = isBlock ? theme.danger : theme.success;
  const badgeBg = isBlock
    ? "rgba(239, 68, 68, 0.2)"
    : "rgba(16, 185, 129, 0.2)";
  const iconName = isBlock ? "person-remove" : "lock-open";
  const iconColor = isBlock ? theme.danger : theme.success;
  const title = isBlock ? "Usuario Bloqueado" : "Usuario Desbloqueado";

  const description = isBlock ? (
    <Text style={[styles.detailsText, { color: theme.textSecondary }]}>
      El acceso de{" "}
      <Text style={{ color: theme.text, fontWeight: "700" }}>{user.name}</Text>{" "}
      ha sido restringido temporalmente.
    </Text>
  ) : (
    <Text style={[styles.detailsText, { color: theme.textSecondary }]}>
      El usuario{" "}
      <Text style={{ color: theme.text, fontWeight: "700" }}>{user.name}</Text>{" "}
      ha recuperado el acceso a la plataforma correctamente.
    </Text>
  );

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackToProfile} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Action Badge */}
          <View style={[styles.actionBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.actionBadgeText, { color: badgeColor }]}>
              {badgeText}
            </Text>
          </View>

          {/* Success Icon */}
          <View style={styles.iconWrapper}>
            <View
              style={[styles.iconContainer, { backgroundColor: iconColor }]}
            >
              <Ionicons name={iconName} size={48} color="#fff" />
            </View>
            <View
              style={[
                styles.checkBadge,
                {
                  backgroundColor: theme.success,
                  borderColor: theme.background,
                },
              ]}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

          {/* Details */}
          {description}
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={onBackToProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Volver al Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.card }]}
            onPress={onGoToDashboard}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Ir al Listado de Usuarios
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
            Esta acción puede revertirse desde la configuración de seguridad.
          </Text>
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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  iconWrapper: {
    position: "relative",
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  detailsText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    marginTop: spacing.sm,
    opacity: 0.6,
  },
});
