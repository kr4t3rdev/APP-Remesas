import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { AuthWrapper } from "../../components/auth/AuthWrapper";
import { spacing, borderRadius } from "../../theme";
import { useColors } from "../../store/themeStore";
import { forgotPassword } from "../../services/passwordRecovery";

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const themeColors = useColors();
  const styles = createStyles(themeColors);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword(email.trim());
      setSuccess(response.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "No pudimos procesar tu solicitud.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Desktop content
  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.contentDesktop,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {!isDesktop && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={themeColors.primary[500]}
            />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="mail-open-outline"
              size={42}
              color={themeColors.primary[500]}
            />
          </View>
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Te enviaremos un enlace para restablecer tu contraseña.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={themeColors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={themeColors.text.tertiary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={themeColors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={themeColors.secondary[600]}
              />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <Button
            title="Enviar enlace"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate("ResetPassword")}
          >
            <Text style={styles.secondaryActionText}>Ya tengo un token</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Desktop: use AuthWrapper
  if (isDesktop) {
    return (
      <AuthWrapper>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={themeColors.primary[500]}
          />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        {content}
      </AuthWrapper>
    );
  }

  // Mobile: use SafeAreaView
  return <SafeAreaView style={styles.container}>{content}</SafeAreaView>;
};

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      minHeight: "100vh",
      width: "100%",
    },
    content: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
      gap: spacing.xs,
    },
    backButtonText: { color: themeColors.primary[500], fontWeight: "600" },
    header: { alignItems: "center", marginBottom: spacing.xl },
    iconContainer: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: themeColors.primary[50],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: themeColors.text.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 15,
      color: themeColors.text.secondary,
      textAlign: "center",
    },
    card: {
      backgroundColor: themeColors.card,
      padding: spacing.lg,
      borderRadius: borderRadius.xl,
      gap: spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: themeColors.text.secondary,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: themeColors.background,
    },
    inputIcon: { marginRight: spacing.sm },
    input: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: themeColors.text.primary,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: themeColors.danger + "15",
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    errorText: { color: themeColors.danger, flex: 1, fontWeight: "500" },
    successBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: themeColors.secondary[50],
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    successText: {
      color: themeColors.secondary[700],
      flex: 1,
      fontWeight: "500",
    },
    secondaryAction: { alignItems: "center", marginTop: spacing.sm },
    secondaryActionText: { color: themeColors.primary[500], fontWeight: "600" },
  });
