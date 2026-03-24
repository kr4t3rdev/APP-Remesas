import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { DashboardSystemUsageRow } from "../../modules/admin/application/useAdminReportsDashboard";

type AdminReportsSystemUsageSectionProps = {
  rows: DashboardSystemUsageRow[];
  onRowPress?: (row: DashboardSystemUsageRow) => void;
  delay?: number;
};

export const AdminReportsSystemUsageSection: React.FC<
  AdminReportsSystemUsageSectionProps
> = ({ rows, onRowPress, delay = 150 }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <FadeInDown delay={delay} duration={280}>
      <View style={styles.wrapper} testID="admin-reports-system-usage">
        <Text style={styles.sectionTitle}>Uso del Sistema</Text>

        {rows.map((row) => {
          const statusColor =
            row.status === "ok"
              ? "#00D08C"
              : row.status === "warning"
                ? "#F2B646"
                : colors.text.secondary;

          return (
            <TouchableOpacity
              key={row.id}
              accessibilityRole="button"
              accessibilityLabel={`Detalle de ${row.title}`}
              testID={`admin-reports-system-row-${row.id}`}
              onPress={() => onRowPress?.(row)}
              style={styles.row}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: `${statusColor}22` },
                ]}
              >
                <Ionicons name={row.icon} size={20} color={statusColor} />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </FadeInDown>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontWeight: "700",
      fontSize: 20,
      marginBottom: spacing.sm,
    },
    row: {
      minHeight: 72,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      flex: 1,
    },
    rowTitle: {
      color: colors.text.primary,
      fontSize: 17,
      fontWeight: "700",
    },
    rowSubtitle: {
      color: colors.text.secondary,
      fontSize: 14,
      marginTop: 2,
    },
  });
