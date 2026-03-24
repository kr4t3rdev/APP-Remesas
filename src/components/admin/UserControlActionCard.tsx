import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../animations";
import { useColors, useShadows } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { AdminUserControlActionType } from "../../types";

type UserControlActionCardProps = {
  actionType: AdminUserControlActionType;
  title: string;
  description: string;
  onPress: () => void;
  risk?: "low" | "medium" | "high";
  testID?: string;
};

export const UserControlActionCard: React.FC<UserControlActionCardProps> = ({
  actionType,
  title,
  description,
  onPress,
  risk = "low",
  testID,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(
    () => createStyles(colors, shadows, risk),
    [colors, shadows, risk],
  );

  const iconName: keyof typeof Ionicons.glyphMap =
    actionType === "SUSPEND_ACCOUNT" || actionType === "TEMP_BLOCK"
      ? "lock-closed"
      : actionType === "CHANGE_ROLE"
        ? "person-circle"
        : actionType === "REVOKE_ALL_SESSIONS"
          ? "shield-checkmark"
          : actionType === "FORCE_PASSWORD_RESET"
            ? "key"
            : actionType === "EXTEND_LICENSE"
              ? "calendar"
              : "construct";

  return (
    <PressableScale onPress={onPress} scale={0.97} style={styles.animatedWrap}>
      <TouchableOpacity
        accessibilityRole="button"
        testID={testID}
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.92}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={16} color={styles.iconColor.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </TouchableOpacity>
    </PressableScale>
  );
};

const createStyles = (
  colors: ReturnType<typeof useColors>,
  shadows: ReturnType<typeof useShadows>,
  risk: "low" | "medium" | "high",
) => {
  const riskColor =
    risk === "high"
      ? colors.danger
      : risk === "medium"
        ? colors.warning
        : colors.primary[500];

  return StyleSheet.create({
    animatedWrap: {
      marginBottom: spacing.sm,
    },
    container: {
      minHeight: 44,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: `${riskColor}66`,
      backgroundColor: colors.card,
      padding: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      ...shadows.sm,
    },
    iconWrap: {
      width: 30,
      height: 30,
      borderRadius: 999,
      backgroundColor: `${riskColor}20`,
      alignItems: "center",
      justifyContent: "center",
    },
    iconColor: {
      color: riskColor,
    },
    content: {
      flex: 1,
    },
    title: {
      color: colors.text.primary,
      fontWeight: "700",
      fontSize: 13,
    },
    description: {
      color: colors.text.secondary,
      marginTop: 2,
      fontSize: 12,
      lineHeight: 17,
    },
  });
};
