import type React from "react";
import { useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import { AppLogo } from "../branding/AppLogo";

type AboutModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const AboutModal: React.FC<AboutModalProps> = ({
  visible,
  onClose,
}) => {
  const colors = useColors();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80) onClose();
      },
    }),
  ).current;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View
            style={styles.handleContainer}
            {...panResponder.panHandlers}
          >
            <View style={[styles.handle, { backgroundColor: colors.text.secondary }]} />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconWrapper}>
              <AppLogo size={80} style={styles.iconCircle} />
            </View>

            <Text style={[styles.appName, { color: colors.text.primary }]}>
              Cashflow
            </Text>
            <Text style={[styles.version, { color: colors.text.secondary }]}>
              Versión 1.0.0
            </Text>

            <View
              style={[
                styles.divider,
                { backgroundColor: colors.border },
              ]}
            />

            <Text style={[styles.description, { color: colors.text.secondary }]}>
              Sistema integral de gestión para casas de cambio. Control de
              inventario de divisas, reportes financieros, administración de
              trabajadores y seguimiento de operaciones en tiempo real.
            </Text>

            <View style={styles.featuresList}>
              {[
                { icon: "swap-horizontal", label: "Operaciones de compra y venta" },
                { icon: "people", label: "Gestión de trabajadores y cajas" },
                { icon: "bar-chart", label: "Reportes y análisis financieros" },
                { icon: "shield-checkmark", label: "Control de acceso y auditoría" },
              ].map((feature) => (
                <View key={feature.label} style={styles.featureItem}>
                  <Ionicons
                    name={feature.icon as any}
                    size={16}
                    color={colors.primary[500]}
                  />
                  <Text
                    style={[styles.featureLabel, { color: colors.text.primary }]}
                  >
                    {feature.label}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: colors.text.secondary }]}
              >
                Desarrollado por
              </Text>
              <Text style={[styles.devName, { color: colors.primary[500] }]}>
                kr4t3rdev
              </Text>
            </View>

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "85%",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  version: {
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureLabel: {
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    paddingBottom: spacing.md,
  },
  footerText: {
    fontSize: 13,
  },
  devName: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
});
