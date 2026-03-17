import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaleIn } from '../animations';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { DashboardMetricTile } from '../../modules/admin/application/useAdminReportsDashboard';

type AdminReportsMetricTileProps = {
  metric: DashboardMetricTile;
  delay?: number;
};

export const AdminReportsMetricTile: React.FC<AdminReportsMetricTileProps> = ({ metric, delay = 60 }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trendColor =
    metric.trend.direction === 'up'
      ? '#00D08C'
      : metric.trend.direction === 'down'
      ? '#FF3F7D'
      : colors.text.secondary;

  const trendBg =
    metric.trend.direction === 'up'
      ? 'rgba(0, 208, 140, 0.16)'
      : metric.trend.direction === 'down'
      ? 'rgba(255, 63, 125, 0.16)'
      : `${colors.text.secondary}20`;

  const trendIcon =
    metric.trend.direction === 'up'
      ? 'trending-up'
      : metric.trend.direction === 'down'
      ? 'trending-down'
      : 'remove';

  return (
    <ScaleIn delay={delay}>
      <View style={styles.card} testID={`admin-reports-metric-${metric.id}`}>
        <View style={styles.titleRow}>
          <Ionicons name={metric.icon} size={16} color={colors.text.secondary} />
          <Text style={styles.title}>{metric.title.toUpperCase()}</Text>
        </View>

        <Text style={styles.value}>{metric.valueLabel}</Text>

        <View style={[styles.trendBadge, { backgroundColor: trendBg }]}>
          <Ionicons name={trendIcon} size={12} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>{metric.trend.valueLabel}</Text>
        </View>
      </View>
    </ScaleIn>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      minHeight: 160,
      justifyContent: 'space-between',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    title: {
      color: colors.text.secondary,
      fontWeight: '700',
      letterSpacing: 1,
      fontSize: 15,
    },
    value: {
      color: colors.text.primary,
      fontSize: 28,
      fontWeight: '800',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    trendBadge: {
      minHeight: 28,
      alignSelf: 'flex-start',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    trendText: {
      fontWeight: '700',
      fontSize: 13,
    },
  });
