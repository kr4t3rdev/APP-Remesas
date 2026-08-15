import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AppLogo } from "../../components/branding/AppLogo";
import { useColors } from "../../store/themeStore";
import { webBreakpoints, webMetrics, webType } from "../design/webTokens";

export type WebPublicRoute = "landing" | "login" | "register";
export type WebLandingSection = "operaciones" | "control" | "acceso";

interface WebPublicHeaderProps {
  current: WebPublicRoute;
  navigation?: any;
  onHomePress?: () => void;
  onSectionPress?: (section: WebLandingSection) => void;
}

export function WebPublicHeader({
  current,
  navigation,
  onHomePress,
  onSectionPress,
}: WebPublicHeaderProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isMobile = width < webBreakpoints.tablet;
  const styles = createStyles(colors, isMobile);
  const goHome = () => {
    if (onHomePress) {
      onHomePress();
      return;
    }
    navigation?.navigate("Welcome");
  };
  const goTo = (route: "Login" | "Register") => navigation?.navigate(route);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir al inicio"
        onPress={goHome}
        style={styles.brand}
      >
        <AppLogo size={34} />
        <View>
          <Text style={styles.brandName}>Cashflow</Text>
          <Text style={styles.brandMeta}>MESA DE CAMBIO</Text>
        </View>
      </Pressable>

      {!isMobile && current === "landing" ? (
        <View style={styles.nav}>
          {([
            ["operaciones", "Operaciones"],
            ["control", "Control"],
            ["acceso", "Acceso"],
          ] as const).map(([section, label]) => (
            <Pressable
              key={section}
              accessibilityRole="link"
              onPress={() => onSectionPress?.(section)}
              style={styles.navLink}
            >
              <Text style={styles.navLinkText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.headerActions}>
        {current !== "login" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            onPress={() => goTo("Login")}
            style={({ pressed }) => [styles.headerLogin, pressed && styles.pressed]}
          >
            <Text style={styles.headerLoginText}>Iniciar sesión</Text>
          </Pressable>
        ) : null}
        {current !== "register" && !isMobile ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
            onPress={() => goTo("Register")}
            style={({ pressed }) => [styles.headerRegister, pressed && styles.pressed]}
          >
            <Text style={styles.headerRegisterText}>Crear cuenta</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, isMobile: boolean) =>
  StyleSheet.create({
    header: {
      minHeight: 72,
      paddingHorizontal: isMobile ? 18 : 40,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
      zIndex: 2,
    },
    brand: { minHeight: webMetrics.touchTarget, flexDirection: "row", alignItems: "center", gap: 10 },
    brandName: { color: colors.text.primary, fontFamily: webType.family, fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
    brandMeta: { color: colors.text.tertiary, fontFamily: webType.family, fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginTop: 2 },
    nav: { flexDirection: "row", alignItems: "center", gap: 5, marginLeft: "auto", marginRight: 28 },
    navLink: { minHeight: webMetrics.touchTarget, justifyContent: "center", paddingHorizontal: 12 },
    navLinkText: { color: colors.text.secondary, fontFamily: webType.family, fontSize: 13, fontWeight: "600" },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerLogin: { minHeight: webMetrics.touchTarget, justifyContent: "center", paddingHorizontal: 13 },
    headerLoginText: { color: colors.text.primary, fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
    headerRegister: { minHeight: webMetrics.touchTarget, justifyContent: "center", paddingHorizontal: 16, borderRadius: webMetrics.fieldRadius, backgroundColor: colors.primary[600] },
    headerRegisterText: { color: colors.text.inverse, fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
    pressed: { opacity: 0.78 },
  });
