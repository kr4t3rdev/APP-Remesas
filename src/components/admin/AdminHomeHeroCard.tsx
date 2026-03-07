import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '../animations';
import { useColors, useIsDark } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

export type AdminHomeHeroCardProps = {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  primaryLabel: string;
  secondaryLabel: string;
};

export const AdminHomeHeroCard: React.FC<AdminHomeHeroCardProps> = ({
  title,
  value,
  trend,
  trendLabel,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  secondaryLabel,
}) => {
  const colors = useColors();
  const isDark = useIsDark();
  const gradientColors = isDark
    ? [colors.primary[700], colors.primary[500]]
    : [colors.primary[600], colors.primary[400]];

  const trendColor =
    trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.text.inverse;
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : null;

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iconBadge}>
            <Ionicons name="wallet-outline" size={20} color={colors.text.inverse} />
          </View>
        </View>
        <Text style={styles.value}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
        {trend != null && trendLabel && (
          <View style={styles.trendRow}>
            {trendIcon && (
              <Ionicons name={trendIcon as any} size={14} color={trendColor} style={styles.trendIcon} />
            )}
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
              {trendLabel}
            </Text>
          </View>
        )}
        <View style={styles.actions}>
          <PressableScale onPress={onPrimaryAction} scale={0.97} style={styles.primaryButton}>
            <Ionicons name="add" size={18} color={colors.text.inverse} />
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </PressableScale>
          <PressableScale onPress={onSecondaryAction} scale={0.97} style={styles.secondaryButton}>
            <Ionicons name="arrow-forward" size={18} color={colors.text.inverse} />
            <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
          </PressableScale>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trendIcon: {
    marginRight: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
