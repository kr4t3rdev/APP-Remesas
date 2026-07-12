import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { User } from "../../types";
import { Input } from "../ui/Input";
import { validatePassword } from "../../utils/validators";

const AVATAR_MOCK = "https://i.pravatar.cc/150";
type AdminResetPasswordModalProps = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (newPassword: string) => void;
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
  const [step, setStep] = useState<"warning" | "form">("warning");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

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

  const passwordError = (() => {
    if (step !== "form") return "";
    if (!newPassword.trim()) return "La contraseña es obligatoria";
    if (!validatePassword(newPassword)) {
      return "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula y número";
    }
    if (newPassword !== confirmPassword) return "Las contraseñas no coinciden";
    return "";
  })();

  const mainColor = theme.primary;
  const buttonColor = theme.primary;
  const iconName = "key";
  const title = "Reset Password";
  const cardTitle = step === "warning" ? "Aviso de seguridad" : "Nueva contraseña";
  const confirmText = step === "warning" ? "Continuar" : "Aceptar";

  const handleConfirm = () => {
    if (step === "warning") {
      setStep("form");
      return;
    }

    const validation = passwordError;
    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    onConfirm(newPassword);
  };

  const handleClose = () => {
    setStep("warning");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

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

            {step === "warning" ? (
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                La contraseña actual será reemplazada por una nueva definida por
                el administrador. El usuario recibirá un aviso por seguridad y
                deberá usar esta contraseña en su próximo ingreso.
              </Text>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Nueva contraseña"
                  accessibilityLabel="Nueva contraseña"
                  placeholder="Ingresa la nueva contraseña"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (error) setError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  error={error || (newPassword && !validatePassword(newPassword) ? passwordError : "")}
                />
                <Input
                  label="Confirmar contraseña"
                  accessibilityLabel="Confirmar contraseña"
                  placeholder="Confirma la contraseña"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) setError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  error={confirmPassword && newPassword !== confirmPassword ? "Las contraseñas no coinciden" : ""}
                />
                <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                  La contraseña debe tener mínimo 8 caracteres, incluir mayúscula,
                  minúscula y número.
                </Text>
              </View>
            )}
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
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? "Procesando..." : confirmText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.card }]}
            onPress={handleClose}
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
  form: {
    width: "100%",
    gap: spacing.md,
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
