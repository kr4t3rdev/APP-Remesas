import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "../../store/themeStore";
import { webMetrics, webType } from "../../web/design/webTokens";
import { WebAuthFrame } from "../../web/auth/WebAuthFrame";

interface WelcomeScreenProps {
  navigation?: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <WebAuthFrame
      eyebrow="CASHFLOW / INICIO"
      title="Opera tu casa de cambio con claridad."
      subtitle="Una estación web para ver saldos, mover fondos y cerrar el día con confianza."
      showRail={false}
    >
      <View style={styles.introBand}>
        <Text style={[styles.introTitle, { color: colors.text.primary }]}>
          Tu jornada empieza aquí
        </Text>
        <Text style={[styles.introBody, { color: colors.text.secondary }]}>
          Accedé a tu mesa operativa o creá una cuenta para comenzar a ordenar
          cada operación.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
          onPress={() => navigation?.navigate("Login")}
          style={({ pressed }) => [
            styles.primaryAction,
            { backgroundColor: colors.primary[500] },
            pressed && styles.actionHover,
          ]}
        >
          <Text style={styles.primaryActionText}>Iniciar Sesión</Text>
          <Text style={styles.primaryActionMeta}>Ya tengo una cuenta →</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Crear cuenta"
          onPress={() => navigation?.navigate("Register")}
          style={({ pressed }) => [
            styles.secondaryAction,
            { borderColor: colors.border },
            pressed && {
              backgroundColor: colors.primary[50],
              borderColor: colors.primary[300],
            },
          ]}
        >
          <Text style={[styles.secondaryActionText, { color: colors.text.primary }]}>
            Crear cuenta
          </Text>
          <Text style={[styles.secondaryActionMeta, { color: colors.text.secondary }]}>
            Empezar desde cero →
          </Text>
        </Pressable>
      </View>
    </WebAuthFrame>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    introBand: { gap: 8, marginBottom: 28 },
    introTitle: {
      fontFamily: webType.family,
      fontSize: 18,
      fontWeight: "700",
    },
    introBody: {
      fontFamily: webType.family,
      fontSize: webType.bodySize,
      lineHeight: 23,
    },
    actions: { gap: 12 },
    primaryAction: {
      minHeight: 76,
      borderRadius: webMetrics.fieldRadius,
      paddingHorizontal: 18,
      paddingVertical: 14,
      justifyContent: "center",
      gap: 3,
    },
    actionHover: { opacity: 0.9 },
    primaryActionText: {
      color: "#FFFFFF",
      fontFamily: webType.family,
      fontSize: 15,
      fontWeight: "700",
    },
    primaryActionMeta: {
      color: "#D7E3F8",
      fontFamily: webType.family,
      fontSize: 12,
    },
    secondaryAction: {
      minHeight: 76,
      borderWidth: 1,
      borderRadius: webMetrics.fieldRadius,
      paddingHorizontal: 18,
      paddingVertical: 14,
      justifyContent: "center",
      gap: 3,
    },
    secondaryActionText: {
      fontFamily: webType.family,
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryActionMeta: { fontFamily: webType.family, fontSize: 12 },
  });
