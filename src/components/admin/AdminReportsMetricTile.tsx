import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";
import type { DashboardMetricTile } from "../../modules/admin/application/useAdminReportsDashboard";

type AdminReportsMetricTileProps = {
  metric: DashboardMetricTile;
  delay?: number;
};

export const AdminReportsMetricTile: React.FC<AdminReportsMetricTileProps> = ({
  metric,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trendColor =
    metric.trend.direction === "up"
      ? "#00D08C"
      : metric.trend.direction === "down"
        ? "#FF3F7D"
        : colors.text.secondary;

  const trendIcon =
    metric.trend.direction === "up"
      ? "trending-up"
      : metric.trend.direction === "down"
        ? "trending-down"
        : "remove";

  return (
    <View style={styles.cell} testID={`admin-reports-metric-${metric.id}`}>
      <Text style={styles.label}>{metric.title.toUpperCase()}</Text>
      <Text style={styles.value}>{metric.valueLabel}</Text>
      <View style={styles.trendRow}>
        <Ionicons name={trendIcon} size={11} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {metric.trend.valueLabel}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    cell: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      gap: 4,
      minWidth: 0,
    },
    label: {
      color: colors.text.secondary,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },
    value: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: 2,
    },
    trendText: {
      fontWeight: "700",
      fontSize: 11,
      fontVariant: ["tabular-nums"],
      letterSpacing: 0.3,
    },
  });
