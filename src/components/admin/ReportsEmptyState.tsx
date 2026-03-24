import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";

type ReportsEmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

export const ReportsEmptyState: React.FC<ReportsEmptyStateProps> = ({
  icon,
  title,
  message,
}) => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.text.secondary} />
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: colors.text.secondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    marginTop: spacing.xs,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
