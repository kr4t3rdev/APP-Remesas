import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";

type AdminResetPasswordSuccessModalProps = {
  visible: boolean;
  userEmail: string;
  onBackToProfile: () => void;
  onGoToDashboard: () => void;
};

export const AdminResetPasswordSuccessModal: React.FC<
  AdminResetPasswordSuccessModalProps
> = ({ visible, userEmail, onBackToProfile, onGoToDashboard }) => {
  const colors = useColors();
  const theme = {
    background: colors.background,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    success: colors.success,
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View
            style={[styles.iconContainer, { backgroundColor: theme.success }]}
          >
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Password Reset Successful
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            An email with temporary credentials has been sent to:
          </Text>

          <View style={[styles.emailBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.emailText}>{userEmail}</Text>
          </View>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            The user will receive their temporary credentials shortly and must
            change their password on next login.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={onGoToDashboard}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.primary },
            ]}
            onPress={onBackToProfile}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.primary }]}>
              Back to Profile
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  emailBox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginVertical: spacing.md,
  },
  emailText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : spacing.lg,
    gap: spacing.md,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
