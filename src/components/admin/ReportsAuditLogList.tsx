import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown, FadeIn } from '../animations';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { AdminAuditLog } from '../../types';

type ReportsAuditLogListProps = {
  logs?: AdminAuditLog[];
  loading?: boolean;
  delay?: number;
};

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('block') || actionLower.includes('ban'))
    return 'lock-closed' as const;
  if (actionLower.includes('unblock') || actionLower.includes('reactiv'))
    return 'lock-open' as const;
  if (actionLower.includes('role'))
    return 'person-circle' as const;
  if (actionLower.includes('license'))
    return 'card' as const;
  if (actionLower.includes('password'))
    return 'key' as const;
  if (actionLower.includes('session'))
    return 'shield-checkmark' as const;
  if (actionLower.includes('create'))
    return 'add-circle' as const;
  if (actionLower.includes('update'))
    return 'create' as const;
  if (actionLower.includes('delete'))
    return 'trash' as const;
  return 'construct' as const;
};

const getActionColor = (action: string, colors: ReturnType<typeof useColors>) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('block') || actionLower.includes('ban') || actionLower.includes('suspend'))
    return colors.danger;
  if (actionLower.includes('unblock') || actionLower.includes('react'))
    return colors.success;
  if (actionLower.includes('role'))
    return colors.primary[500];
  if (actionLower.includes('license'))
    return colors.warning;
  return colors.text.secondary;
};

const formatActionName = (action: string) => {
  // Convertir ACTION_NAME a "Action Name"
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ReportsAuditLogList: React.FC<ReportsAuditLogListProps> = ({
  logs = [],
  loading = false,
  delay = 120,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedLogs = useMemo(() => {
    return [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [logs]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>No hay registros de auditoría</Text>
      <Text style={styles.emptyText}>
        Las acciones administrativas aparecerán aquí
      </Text>
    </View>
  );

  const renderHeader = () => (
    <FadeInDown delay={delay - 20} duration={250}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de acciones administrativas</Text>
        <Text style={styles.headerSubtitle}>
          {logs.length} {logs.length === 1 ? 'acción registrada' : 'acciones registradas'}
        </Text>
      </View>
    </FadeInDown>
  );

  if (loading) {
    return (
      <FadeIn>
        <View style={styles.container}>
          <View style={styles.skeleton} />
        </View>
      </FadeIn>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {sortedLogs.length === 0 ? (
        renderEmpty()
      ) : (
        sortedLogs.map((item, index) => {
          const actionColor = getActionColor(item.action, colors);
          return (
            <FadeInDown key={item.id} delay={delay + index * 30} duration={250}>
              <View style={styles.logRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${actionColor}16` }]}>
                  <Ionicons name={getActionIcon(item.action)} size={16} color={actionColor} />
                </View>

                <View style={styles.logContent}>
                  <Text style={styles.logAction}>{formatActionName(item.action)}</Text>
                  {item.reason && (
                    <Text style={styles.logReason} numberOfLines={1}>
                      {item.reason}
                    </Text>
                  )}
                  <Text style={styles.logMeta}>
                    ID Actor: {item.actorUserId}
                    {item.targetUserId && ` • ID Objetivo: ${item.targetUserId}`}
                  </Text>
                </View>

                <Text style={styles.logDate}>{formatDate(item.createdAt)}</Text>
              </View>
            </FadeInDown>
          );
        })
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    header: {
      marginBottom: spacing.md,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    logRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logContent: {
      flex: 1,
    },
    logAction: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    logReason: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    logMeta: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 4,
      opacity: 0.7,
    },
    logDate: {
      fontSize: 11,
      color: colors.text.secondary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
      marginTop: spacing.md,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    emptyText: {
      marginTop: spacing.xs,
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    skeleton: {
      height: 200,
      backgroundColor: colors.border,
      borderRadius: borderRadius.md,
      opacity: 0.3,
    },
  });
