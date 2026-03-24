import React, { useMemo } from "react";
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
import { BlurView } from "expo-blur";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import { AdminUserControlActionType } from "../../types";

const { width } = Dimensions.get("window");

type AdminActionConfirmModalProps = {
  visible: boolean;
  actionType: AdminUserControlActionType | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export const AdminActionConfirmModal: React.FC<
  AdminActionConfirmModalProps
> = ({ visible, actionType, onConfirm, onCancel, loading = false }) => {
  // Theme
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    danger: colors.danger,
    warning: colors.warning,
    overlay: "rgba(15, 23, 42, 0.75)", // Kept dark for overlay
  };

  const getActionDetails = () => {
    switch (actionType) {
      case "SUSPEND_ACCOUNT":
        return {
          title: "¿Confirmar Suspensión?",
          message:
            "¿Estás seguro de que deseas suspender a este usuario? Esto suspenderá el acceso del usuario inmediatamente y revocará todas las sesiones activas.",
          confirmText: "Confirmar Suspensión",
          icon: "warning",
          color: theme.warning,
        };
      case "temp_block": // Mapping legacy/lowercase if needed, though types say UPPER
      case "TEMP_BLOCK":
        return {
          title: "¿Bloquear Temporalmente?",
          message:
            "El usuario perderá acceso hasta que sea desbloqueado manualmente.",
          confirmText: "Confirmar Bloqueo",
          icon: "lock-closed",
          color: theme.warning,
        };
      case "FORCE_PASSWORD_RESET":
        return {
          title: "¿Resetear Contraseña?",
          message:
            "Se enviará un correo al usuario para restablecer su contraseña. Su sesión actual se cerrará.",
          confirmText: "Confirmar Reset",
          icon: "key",
          color: theme.primary,
        };
      case "REVOKE_ALL_SESSIONS":
        return {
          title: "¿Cerrar Sesiones?",
          message:
            "Todas las sesiones activas de este usuario se cerrarán inmediatamente.",
          confirmText: "Cerrar Todas",
          icon: "log-out",
          color: theme.danger,
        };
      default:
        return {
          title: "¿Confirmar Acción?",
          message: "¿Estás seguro de que deseas realizar esta acción?",
          confirmText: "Confirmar",
          icon: "alert-circle",
          color: theme.primary,
        };
    }
  };

  const details = getActionDetails();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: theme.card }]}>
          {/* Handle/Indicator */}
          <View style={styles.handle} />

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${details.color}20` },
            ]}
          >
            <Ionicons
              name={details.icon as any}
              size={32}
              color={details.color}
            />
          </View>

          {/* Text Content */}
          <Text style={[styles.title, { color: theme.text }]}>
            {details.title}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {details.message}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.confirmButton,
                { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? "Procesando..." : details.confirmText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              disabled={loading}
              style={[
                styles.cancelButton,
                { borderColor: theme.textSecondary },
              ]}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 32,
    padding: spacing.xl,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#334155",
    marginBottom: spacing.lg,
    marginTop: -spacing.sm, // Pull up slightly
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actions: {
    width: "100%",
    gap: spacing.md,
  },
  confirmButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155", // Default border color fallback
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
