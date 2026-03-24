import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";

const FEATURES = [
  { icon: "swap-horizontal", colorKey: "primary", text: "Cambio de divisas" },
  { icon: "receipt", colorKey: "secondary", text: "Control de transacciones" },
  { icon: "wallet", colorKey: "accent", text: "Gestión de efectivo" },
  { icon: "bar-chart", colorKey: "info", text: "Reportes detallados" },
];

interface BrandingPanelProps {
  appName?: string;
  tagline?: string;
}

const FEATURE_COLORS: Record<string, { bg: string; icon: string }> = {
  primary: { bg: "rgba(255,255,255,0.15)", icon: "#FFFFFF" },
  secondary: { bg: "rgba(34,197,94,0.2)", icon: "#22C55E" },
  accent: { bg: "rgba(245,158,11,0.2)", icon: "#F59E0B" },
  info: { bg: "rgba(59,130,246,0.2)", icon: "#3B82F6" },
};

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  appName = "XChange$ocial",
  tagline = "Tu gestor de finanzas personales",
}) => {
  const colors = useColors();

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacityAnim, translateYAnim]);

  return (
    <LinearGradient
      testID="branding-panel"
      colors={[colors.primary[500], colors.primary[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <Animated.View
        style={[
          styles.content,
          { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] },
        ]}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Ionicons name="cash" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => {
            const featureColor = FEATURE_COLORS[feature.colorKey];
            return (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: featureColor.bg },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={20}
                    color={featureColor.icon}
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 {appName}</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    zIndex: 1,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  featuresContainer: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export default BrandingPanel;
