import React, { useState, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthWrapper } from "../../components/auth/AuthWrapper";
import { spacing, borderRadius } from "../../theme";
import { useColors } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { showError } from "../../store/toastStore";

interface LoginScreenProps {
  navigation?: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [btnHovered, setBtnHovered] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = "Por favor complete todos los campos";
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al iniciar sesión";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : styles.scrollContentMobile,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header - only on mobile, on desktop it's in BrandingPanel */}
        {!isDesktop && (
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Volver al inicio"
              hitSlop={8}
              onPress={() => navigation?.navigate("Welcome")}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.primary[500]}
              />
              <Text
                style={[
                  styles.backButtonText,
                  { color: colors.primary[500] },
                ]}
              >
                Volver
              </Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                Casa de Cambio
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                Inicia sesión para continuar
              </Text>
            </View>
          </View>
        )}

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Input
            label="Correo electrónico"
            placeholder="admin@cambios.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={{ marginTop: spacing.md }}>
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}

          <View style={{ marginTop: spacing.lg }}>
            <Animated.View
              style={{
                transform: [{ scale: btnScale }],
                opacity: isDesktop ? (btnHovered ? 0.85 : 1) : 1,
              }}
            >
              <TouchableOpacity
                onPress={handleLogin}
                onPressIn={() => {
                  if (!isDesktop) {
                    Animated.timing(btnScale, {
                      toValue: 0.97,
                      duration: 100,
                      useNativeDriver: true,
                    }).start();
                  }
                }}
                onPressOut={() => {
                  if (!isDesktop) {
                    Animated.timing(btnScale, {
                      toValue: 1,
                      duration: 100,
                      useNativeDriver: true,
                    }).start();
                  }
                }}
                // @ts-ignore - web-only hover events
                onMouseEnter={() => {
                  if (isDesktop) {
                    setBtnHovered(true);
                    Animated.spring(btnScale, {
                      toValue: 1.02,
                      useNativeDriver: true,
                    }).start();
                  }
                }}
                // @ts-ignore - web-only hover events
                onMouseLeave={() => {
                  if (isDesktop) {
                    setBtnHovered(false);
                    Animated.spring(btnScale, {
                      toValue: 1,
                      useNativeDriver: true,
                    }).start();
                  }
                }}
                disabled={loading}
              >
                <View
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.primary[500] },
                    loading && { opacity: 0.5 },
                  ]}
                >
                  {loading ? (
                    <Text style={styles.primaryButtonTextLoading}>
                      Cargando...
                    </Text>
                  ) : (
                    <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text
              style={[
                styles.forgotPasswordText,
                { color: colors.primary[500] },
              ]}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Link - only on mobile */}
        {!isDesktop && (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>
              ¿No tienes cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation?.navigate("Register")}>
              <Text
                style={[styles.registerLink, { color: colors.primary[500] }]}
              >
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // On desktop, wrap with AuthWrapper for split layout
  if (isDesktop) {
    return (
      <AuthWrapper>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
          hitSlop={8}
          onPress={() => navigation?.navigate("Welcome")}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.primary[500]}
          />
          <Text
            style={[styles.backButtonText, { color: colors.primary[500] }]}
          >
            Volver al inicio
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.desktopTitle, { color: colors.text.primary }]}
        >
          Iniciar Sesión
        </Text>
        <Text
          style={[styles.desktopSubtitle, { color: colors.text.secondary }]}
        >
          Ingresa tus credenciales para continuar
        </Text>
        {content}
        <View style={styles.desktopFooter}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            ¿No tienes cuenta?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation?.navigate("Register")}>
            <Text style={[styles.registerLink, { color: colors.primary[500] }]}>
              Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </AuthWrapper>
    );
  }

  // On mobile, use SafeAreaView directly
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  scrollContentMobile: {
    justifyContent: "center",
  },
  scrollContentDesktop: {
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  titleContainer: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  desktopTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  desktopSubtitle: {
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: 20,
    ...Platform.select({
      web: { boxShadow: "0 18px 48px rgba(15, 23, 42, 0.12)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
    }),
    elevation: 5,
  },
  errorText: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  forgotPassword: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  desktopFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  primaryButtonTextLoading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default LoginScreen;
