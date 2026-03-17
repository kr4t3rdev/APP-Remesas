import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FadeInDown } from '../animations';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { AdminReportsPeriod } from '../../modules/admin/application/useAdminReportsDashboard';

type AdminReportsPeriodSegmentProps = {
  value: AdminReportsPeriod;
  onChange: (period: AdminReportsPeriod) => void;
  delay?: number;
};

const OPTIONS: Array<{ id: AdminReportsPeriod; label: string }> = [
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensual' },
  { id: 'annual', label: 'Anual' },
];

export const AdminReportsPeriodSegment: React.FC<AdminReportsPeriodSegmentProps> = ({
  value,
  onChange,
  delay = 30,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <FadeInDown delay={delay} duration={260}>
      <View style={styles.container} testID="admin-reports-period-segment">
        {OPTIONS.map((option) => {
          const isActive = option.id === value;
          return (
            <TouchableOpacity
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`Período ${option.label}`}
              accessibilityState={{ selected: isActive }}
              testID={`admin-reports-period-${option.id}`}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => onChange(option.id)}
            >
              <Text style={[styles.itemText, isActive && styles.itemTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </FadeInDown>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      padding: 6,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    item: {
      flex: 1,
      minHeight: 44,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemActive: {
      backgroundColor: colors.surface,
    },
    itemText: {
      color: colors.text.secondary,
      fontSize: 14,
      fontWeight: '700',
    },
    itemTextActive: {
      color: colors.text.primary,
    },
  });
