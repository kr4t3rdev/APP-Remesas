import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown, FadeIn } from '../animations';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { User } from '../../types';

type BlockedUser = User & {
  blockedReason?: string;
  blockedAt?: string;
};

type ReportsBlockedListProps = {
  users?: BlockedUser[];
  loading?: boolean;
  delay?: number;
};

export const ReportsBlockedList: React.FC<ReportsBlockedListProps> = ({
  users = [],
  loading = false,
  delay = 120,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isBlocked = (user: User) => {
    return user.isBanned || (user.blockedUntil && new Date(user.blockedUntil) > new Date());
  };

  const blockedUsers = useMemo(() => {
    return users.filter(isBlocked);
  }, [users]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="shield-checkmark" size={64} color={colors.success} />
      <Text style={styles.emptyTitle}>No hay usuarios bloqueados</Text>
      <Text style={styles.emptyText}>
        Todos los usuarios tienen acceso activo al sistema
      </Text>
    </View>
  );

  const renderHeader = () => (
    <FadeInDown delay={delay - 20} duration={250}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{blockedUsers.length}</Text>
            <Text style={styles.statLabel}>Bloqueados</Text>
          </View>
        </View>
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
      {blockedUsers.length === 0 ? (
        renderEmpty()
      ) : (
        blockedUsers.map((item, index) => (
          <FadeInDown key={item.id} delay={delay + index * 30} duration={250}>
            <View style={styles.userRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="lock-closed" size={18} color={colors.danger} />
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>

              <View style={styles.blockInfo}>
                <Text style={styles.blockLabel}>Bloqueado</Text>
                <Text style={styles.blockDate}>{formatDate(item.blockedUntil ?? item.bannedUntil ?? undefined)}</Text>
              </View>
            </View>
          </FadeInDown>
        ))
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
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    statItem: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      minWidth: 100,
      ...shadows.sm,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.danger,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: `${colors.danger}30`,
      ...shadows.sm,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${colors.danger}16`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    userEmail: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    blockInfo: {
      alignItems: 'flex-end',
    },
    blockLabel: {
      fontSize: 11,
      color: colors.danger,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    blockDate: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 2,
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
