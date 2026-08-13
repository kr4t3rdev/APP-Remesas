import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";
import type { AdminReportsPeriod } from "../../modules/admin/application/useAdminReportsDashboard";

type AdminReportsPeriodSegmentProps = {
  value: AdminReportsPeriod;
  onChange: (period: AdminReportsPeriod) => void;
  delay?: number;
};

const OPTIONS: Array<{ id: AdminReportsPeriod; label: string }> = [
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
  { id: "annual", label: "Anual" },
];

export const AdminReportsPeriodSegment: React.FC<
  AdminReportsPeriodSegmentProps
> = ({ value, onChange }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container} testID="admin-reports-period-segment">
      <Text style={styles.label}>PERÍODO</Text>
      <View style={styles.segments}>
        {OPTIONS.map((option, index) => {
          const isActive = option.id === value;
          return (
            <TouchableOpacity
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`Período ${option.label}`}
              accessibilityState={{ selected: isActive }}
              testID={`admin-reports-period-${option.id}`}
              style={[
                styles.item,
                isActive && styles.itemActive,
                index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
              ]}
              onPress={() => onChange(option.id)}
            >
              <Text
                style={[styles.itemText, isActive && styles.itemTextActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    label: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: colors.text.secondary,
    },
    segments: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      overflow: "hidden",
      flex: 1,
    },
    item: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    itemActive: {
      backgroundColor: colors.primary[500],
    },
    itemText: {
      color: colors.text.secondary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    itemTextActive: {
      color: "#fff",
    },
  });
