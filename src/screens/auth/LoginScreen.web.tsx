import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useColors } from "../../store/themeStore";
import { showError } from "../../store/toastStore";
import { webMetrics, webType } from "../../web/design/webTokens";
import { WebAuthFrame, WebField } from "../../web/auth/WebAuthFrame";

interface LoginScreenProps {
  navigation?: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      const message = "Completa tu correo y contraseña para continuar.";
      setError(message);
      showError(message);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No pudimos iniciar sesión. Revisa tus datos e intenta nuevamente.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebAuthFrame
      navigation={navigation}
      publicRoute="login"
      eyebrow="CASHFLOW / ACCESO"
      title="Vuelve a tu mesa operativa."
      subtitle="Inicia sesión para continuar"
      footer={
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            ¿Todavía no tienes cuenta?
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Crear una cuenta"
            onPress={() => navigation?.navigate("Register")}
          >
            <Text style={[styles.footerLink, { color: colors.primary[600] }]}>
              Crear cuenta
            </Text>
          </Pressable>
        </View>
      }
    >
      <WebField
        testID="web-login-email"
        label="Correo electrónico"
        placeholder="admin@cambios.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <WebField
        testID="web-login-password"
        label="Contraseña"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? (
        <View
          accessibilityRole="alert"
          style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}
        >
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        </View>
      ) : null}
      <Pressable
        testID="web-login-submit"
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
        onPress={handleLogin}
        disabled={loading}
        style={({ pressed }) => [
          styles.submit,
          { backgroundColor: colors.primary[500] },
          pressed && styles.submitHover,
          loading && styles.submitDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
        <Text style={styles.submitText}>Iniciar Sesión</Text>
        )}
      </Pressable>
      <Text style={[styles.helper, { color: colors.text.tertiary }]}>
        Si necesitas recuperar el acceso, contacta al administrador de tu casa
        de cambio.
      </Text>
    </WebAuthFrame>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    submit: {
      minHeight: webMetrics.controlHeight,
      borderRadius: webMetrics.fieldRadius,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 6,
    },
    submitHover: { opacity: 0.9 },
    submitDisabled: { opacity: 0.55 },
    submitText: {
      color: "#FFFFFF",
      fontFamily: webType.family,
      fontSize: 15,
      fontWeight: "700",
    },
    errorBox: { borderRadius: 8, padding: 12, marginBottom: 14 },
    errorText: { fontFamily: webType.family, fontSize: 13, lineHeight: 19 },
    helper: {
      fontFamily: webType.family,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 18,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    footerText: { fontFamily: webType.family, fontSize: 13 },
    footerLink: { fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
  });
