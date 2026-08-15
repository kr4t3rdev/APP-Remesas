import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useColors } from "../../store/themeStore";
import { webBreakpoints, webMetrics, webType } from "../design/webTokens";
import { WebPublicHeader, type WebPublicRoute } from "./WebPublicHeader";

interface WebAuthFrameProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  navigation?: any;
  publicRoute?: Exclude<WebPublicRoute, "landing">;
}

export function WebAuthFrame({
  eyebrow = "CASHFLOW / ESTACIÓN OPERATIVA",
  title,
  subtitle,
  children,
  footer,
  navigation,
  publicRoute,
}: WebAuthFrameProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isDesktop = width >= webBreakpoints.desktop;
  const styles = createStyles(colors);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <WebPublicHeader
        current={publicRoute ?? "login"}
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          !isDesktop && styles.contentMobile,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
            onPress={() => navigation?.navigate("Welcome")}
            style={({ pressed }) => [
              styles.backRow,
              pressed && styles.backRowPressed,
            ]}
          >
            <Text style={[styles.backArrow, { color: colors.primary[600] }]}>
              {"\u2190"}
            </Text>
            <Text style={[styles.backText, { color: colors.primary[600] }]}>
              Volver al inicio
            </Text>
          </Pressable>
          <View style={styles.panelHeader}>
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
    root: { flex: 1, flexDirection: "column", minHeight: "100%" },
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
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      alignSelf: "flex-start",
      minHeight: webMetrics.touchTarget,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginLeft: -10,
      marginTop: -14,
      marginBottom: 10,
      borderRadius: webMetrics.fieldRadius,
    },
    backRowPressed: { opacity: 0.6 },
    backArrow: {
      fontFamily: webType.family,
      fontSize: 18,
      lineHeight: 20,
      fontWeight: "700",
    },
    backText: {
      fontFamily: webType.family,
      fontSize: 13,
      fontWeight: "600",
    },
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
