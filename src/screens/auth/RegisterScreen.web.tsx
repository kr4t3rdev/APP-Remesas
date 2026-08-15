import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../utils/alert";
import api from "../../services/api";
import { checkEmailExists, checkNicknameExists } from "../../services/authValidationApi";
import { useDebounce } from "../../hooks/useDebounce";
import {
  validateEmail,
  validateForm,
  validateNickname,
  type FormData,
  type ValidatorErrors,
} from "../../utils/validators";
import { useColors } from "../../store/themeStore";
import { webMetrics, webType } from "../../web/design/webTokens";
import { WebAuthFrame, WebField } from "../../web/auth/WebAuthFrame";

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<ValidatorErrors>({});
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const debouncedEmail = useDebounce(form.email, 500);
  const debouncedNickname = useDebounce(form.nickname, 500);

  useEffect(() => {
    if (!debouncedEmail) return;
    if (!validateEmail(debouncedEmail)) {
      setErrors((current) => ({ ...current, email: "Ingresa un correo válido." }));
      return;
    }
    let active = true;
    setCheckingEmail(true);
    checkEmailExists(debouncedEmail)
      .then((exists) => {
        if (active && exists) {
          setErrors((current) => ({ ...current, email: "Este correo ya está registrado." }));
        }
      })
      .catch(() => undefined)
      .finally(() => active && setCheckingEmail(false));
    return () => {
      active = false;
    };
  }, [debouncedEmail]);

  useEffect(() => {
    if (!debouncedNickname || !validateNickname(debouncedNickname)) return;
    let active = true;
    setCheckingNickname(true);
    checkNicknameExists(debouncedNickname)
      .then((exists) => {
        if (active && exists) {
          setErrors((current) => ({ ...current, nickname: "Este apodo ya está en uso." }));
        }
      })
      .catch(() => undefined)
      .finally(() => active && setCheckingNickname(false));
    return () => {
      active = false;
    };
  }, [debouncedNickname]);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key as keyof ValidatorErrors]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const handleRegister = async () => {
    const data: FormData = { ...form, acceptedTerms };
    const validationErrors = validateForm(data);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || checkingEmail || checkingNickname) return;

    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        nickname: form.nickname.trim() || undefined,
      });
      navigation.replace("VerificationPending", { email: form.email.trim() });
    } catch (error: any) {
      const message = error?.response?.data?.message || "No pudimos crear la cuenta.";
      Alert.alert("No se pudo crear la cuenta", message);
      setErrors({ email: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebAuthFrame
      navigation={navigation}
      publicRoute="register"
      eyebrow="CASHFLOW / REGISTRO"
      title="Crea tu estación de trabajo."
      subtitle="Completa tus datos y comienza a ordenar la operación de tu casa de cambio."
      footer={
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>¿Ya tienes una cuenta?</Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Iniciar sesión"
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.footerLink, { color: colors.primary[600] }]}>Iniciar sesión</Text>
          </Pressable>
        </View>
      }
    >
      <WebField
        testID="web-register-name"
        label="Nombre completo"
        placeholder="Nombre y apellido"
        value={form.name}
        onChangeText={update("name")}
        autoCapitalize="words"
        error={errors.name}
      />
      <WebField
        testID="web-register-nickname"
        label="Apodo (opcional)"
        placeholder="Tu identificador"
        value={form.nickname}
        onChangeText={update("nickname")}
        error={errors.nickname}
        editable={!checkingNickname}
      />
      <WebField
        testID="web-register-email"
        label="Correo electrónico"
        placeholder="nombre@casadecambio.com"
        value={form.email}
        onChangeText={update("email")}
        keyboardType="email-address"
        error={errors.email}
        editable={!checkingEmail}
      />
      <WebField
        testID="web-register-password"
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={form.password}
        onChangeText={update("password")}
        secureTextEntry
        error={errors.password}
      />
      <WebField
        testID="web-register-confirm-password"
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
        value={form.confirmPassword}
        onChangeText={update("confirmPassword")}
        secureTextEntry
        error={errors.confirmPassword}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
        onPress={() => setAcceptedTerms((current) => !current)}
        style={styles.termsRow}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: acceptedTerms ? colors.primary[500] : colors.border,
              backgroundColor: acceptedTerms ? colors.primary[500] : "transparent",
            },
          ]}
        >
          {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={[styles.termsText, { color: colors.text.secondary }]}>Acepto los términos y condiciones</Text>
      </Pressable>
      {errors.terms ? <Text style={[styles.termsError, { color: colors.danger }]}>{errors.terms}</Text> : null}
      <Pressable
        testID="web-register-submit"
        accessibilityRole="button"
        accessibilityLabel="Crear cuenta"
        onPress={handleRegister}
        disabled={loading || checkingEmail || checkingNickname}
        style={({ pressed }) => [
          styles.submit,
          { backgroundColor: colors.primary[500] },
          pressed && styles.submitHover,
          (loading || checkingEmail || checkingNickname) && styles.submitDisabled,
        ]}
      >
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Crear cuenta</Text>}
      </Pressable>
    </WebAuthFrame>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    termsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    checkmark: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    termsText: { flex: 1, fontFamily: webType.family, fontSize: 13, lineHeight: 19 },
    termsError: { fontFamily: webType.family, fontSize: 12, marginTop: 6 },
    submit: {
      minHeight: webMetrics.controlHeight,
      borderRadius: webMetrics.fieldRadius,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    submitHover: { opacity: 0.9 },
    submitDisabled: { opacity: 0.55 },
    submitText: { color: "#FFFFFF", fontFamily: webType.family, fontSize: 15, fontWeight: "700" },
    footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
    footerText: { fontFamily: webType.family, fontSize: 13 },
    footerLink: { fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
  });
