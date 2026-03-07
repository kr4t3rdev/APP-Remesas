import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

export type AdminHomeEventRowType = 'login' | 'block' | 'license' | 'other';

export type AdminHomeEventRowProps = {
  action: string;
  createdAt: string;
  type?: AdminHomeEventRowType;
};

const EVENT_LABELS: Record<AdminHomeEventRowType, { icon: 'log-in-outline' | 'lock-closed' | 'key' | 'ellipse'; colorKey: 'primary' | 'warning' | 'danger' | 'secondary' }> = {
  login: { icon: 'log-in-outline', colorKey: 'primary' },
  block: { icon: 'lock-closed', colorKey: 'danger' },
  license: { icon: 'key', colorKey: 'primary' },
  other: { icon: 'ellipse', colorKey: 'secondary' },
};

function deriveTypeFromAction(action: string): AdminHomeEventRowType {
  const lower = action.toLowerCase();
  if (lower.includes('login') || lower.includes('auth') || lower.includes('sign')) return 'login';
  if (lower.includes('block') || lower.includes('suspend') || lower.includes('ban')) return 'block';
  if (lower.includes('license') || lower.includes('subscription') || lower.includes('plan')) return 'license';
  return 'other';
}

function formatEventDate(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export const AdminHomeEventRow: React.FC<AdminHomeEventRowProps> = ({
  action,
  createdAt,
  type: propType,
}) => {
  const colors = useColors();
  const type = propType ?? deriveTypeFromAction(action);
  const { icon, colorKey } = EVENT_LABELS[type];
  const iconColor = colorKey === 'primary' ? colors.primary[500] : colorKey === 'danger' ? colors.danger : colorKey === 'warning' ? colors.warning : colors.text.secondary;
  const bgColor = colorKey === 'primary' ? `${colors.primary[500]}20` : colorKey === 'danger' ? `${colors.danger}20` : colorKey === 'warning' ? `${colors.warning}20` : `${colors.text.secondary}20`;

  const subtitle = useMemo(() => formatEventDate(createdAt), [createdAt]);

  return (
    <View style={styles.row} accessibilityRole="none" testID="admin-home-event-row">
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
          {action}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
