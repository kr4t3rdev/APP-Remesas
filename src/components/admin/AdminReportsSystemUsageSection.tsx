import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";
import type { DashboardSystemUsageRow } from "../../modules/admin/application/useAdminReportsDashboard";

type AdminReportsSystemUsageSectionProps = {
  rows: DashboardSystemUsageRow[];
  onRowPress?: (row: DashboardSystemUsageRow) => void;
  delay?: number;
};

export const AdminReportsSystemUsageSection: React.FC<
  AdminReportsSystemUsageSectionProps
> = ({ rows, onRowPress }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrapper} testID="admin-reports-system-usage">
      <Text style={styles.sectionTitle}>Uso del Sistema</Text>

      {rows.map((row) => {
        const statusColor =
          row.status === "ok"
            ? "#00D08C"
            : row.status === "warning"
              ? "#F2B646"
              : colors.text.secondary;
        const statusLabel =
          row.status === "ok"
            ? "OK"
            : row.status === "warning"
              ? "WARN"
              : "N/A";

        return (
          <TouchableOpacity
            key={row.id}
            accessibilityRole="button"
            accessibilityLabel={`Detalle de ${row.title}`}
            testID={`admin-reports-system-row-${row.id}`}
            onPress={() => onRowPress?.(row)}
            style={styles.row}
            activeOpacity={0.6}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${statusColor}22` },
              ]}
            >
              <Ionicons name={row.icon} size={16} color={statusColor} />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
            </View>

            <View style={[styles.statusBadge, { borderColor: statusColor }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: colors.text.secondary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 2,
    },
    row: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      flex: 1,
    },
    rowTitle: {
      color: colors.text.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    rowSubtitle: {
      color: colors.text.secondary,
      fontSize: 11,
      marginTop: 1,
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.6,
      fontVariant: ["tabular-nums"],
    },
  });
