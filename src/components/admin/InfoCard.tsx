import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";

type Props = {
  title: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  style?: any;
};

export const InfoCard: React.FC<Props> = ({
  title,
  value,
  delta,
  deltaColor,
  icon,
  iconColor,
  style,
}) => {
  const colors = useColors();
  const isDark = colors.background === "#0f172a";
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "#1e293b" : "#fff" },
        style,
      ]}
    >
      <View style={styles.header}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={iconColor ?? "#4f46e5"}
            style={styles.icon}
          />
        )}
        <Text style={[styles.title, { color: isDark ? "#94a3b8" : "#6b7280" }]}>
          {title}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.value, { color: isDark ? "#f8fafc" : "#111827" }]}>
          {displayValue}
        </Text>
        {delta ? (
          <Text style={[styles.delta, { color: deltaColor ?? "green" }]}>
            {delta}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    minWidth: 140,
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  delta: {
    fontSize: 14,
    fontWeight: "600",
  },
});
