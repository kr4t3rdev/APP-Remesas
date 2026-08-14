import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { AppLogo } from "../../components/branding/AppLogo";
import { useColors } from "../../store/themeStore";
import { webBreakpoints, webMetrics, webType } from "../design/webTokens";

interface WebAuthFrameProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showRail?: boolean;
}

export function WebAuthFrame({
  eyebrow = "CASHFLOW / ESTACIÓN OPERATIVA",
  title,
  subtitle,
  children,
  footer,
  showRail = true,
}: WebAuthFrameProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isDesktop = width >= webBreakpoints.desktop;
  const styles = createStyles(colors);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isDesktop && showRail ? (
        <View style={[styles.rail, { backgroundColor: colors.primary[700] }]}>
          <View style={styles.railBrand}>
            <AppLogo size={40} />
            <Text style={styles.railBrandName}>Cashflow</Text>
          </View>
          <View style={styles.railCopy}>
            <Text style={styles.railKicker}>MESA DE CAMBIO</Text>
            <Text style={styles.railTitle}>
              Cada saldo visible. Cada operación en su lugar.
            </Text>
            <Text style={styles.railBody}>
              Una estación de trabajo para operar FX, caja y reportes sin
              perder el hilo del día.
            </Text>
          </View>
          <Text style={styles.railMeta}>SEGURO · MULTIMONEDA · AUDITABLE</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.content,
          !isDesktop && styles.contentMobile,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <View style={styles.panelHeader}>
            {!isDesktop ? <AppLogo size={36} /> : null}
            <Text style={[styles.eyebrow, { color: colors.primary[600] }]}>
              {eyebrow}
            </Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {subtitle}
            </Text>
          </View>
          {children}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </View>
  );
}

interface WebFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  error?: string;
  editable?: boolean;
  testID?: string;
}

export function WebField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  editable = true,
  testID,
}: WebFieldProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text.secondary }]}>
        {label}
      </Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        editable={editable}
        style={[
          styles.field,
          {
            color: colors.text.primary,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      />
      {error ? (
        <Text style={[styles.fieldError, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    root: { flex: 1, flexDirection: "row", minHeight: "100%" },
    rail: {
      flex: 0.42,
      minWidth: 360,
      maxWidth: 560,
      justifyContent: "space-between",
      paddingHorizontal: 48,
      paddingVertical: 44,
    },
    railBrand: { flexDirection: "row", alignItems: "center", gap: 12 },
    railBrandName: {
      color: "#FFFFFF",
      fontFamily: webType.family,
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    railCopy: { maxWidth: 380, gap: 14 },
    railKicker: {
      color: "#BFD4FF",
      fontFamily: webType.family,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.4,
    },
    railTitle: {
      color: "#FFFFFF",
      fontFamily: webType.family,
      fontSize: 36,
      fontWeight: "700",
      lineHeight: 44,
      maxWidth: 360,
    },
    railBody: {
      color: "#D7E3F8",
      fontFamily: webType.family,
      fontSize: 16,
      lineHeight: 25,
      maxWidth: 340,
    },
    railMeta: {
      color: "#BFD4FF",
      fontFamily: webType.family,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.1,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
      width: "100%",
    },
    contentMobile: { padding: 20, paddingVertical: 32 },
    panel: {
      width: "100%",
      maxWidth: 520,
      borderRadius: webMetrics.panelRadius,
      padding: 36,
      borderWidth: 1,
      borderColor: colors.border,
    },
    panelHeader: { gap: 10, marginBottom: 28 },
    eyebrow: {
      fontFamily: webType.family,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.15,
    },
    title: {
      fontFamily: webType.family,
      fontSize: webType.titleSize,
      fontWeight: "700",
      lineHeight: 36,
    },
    subtitle: {
      fontFamily: webType.family,
      fontSize: webType.bodySize,
      lineHeight: 23,
    },
    fieldGroup: { gap: 7, marginBottom: 17 },
    label: {
      fontFamily: webType.family,
      fontSize: webType.labelSize,
      fontWeight: "600",
    },
    field: {
      borderWidth: 1,
      borderRadius: webMetrics.fieldRadius,
      minHeight: webMetrics.controlHeight,
      paddingHorizontal: 13,
      paddingVertical: 10,
      fontFamily: webType.family,
      fontSize: webType.bodySize,
      outlineStyle: "none",
    } as any,
    fieldError: { fontFamily: webType.family, fontSize: 12, lineHeight: 17 },
    footer: { marginTop: 22, alignItems: "center" },
  });

export const webAuthStyles = createStyles;
