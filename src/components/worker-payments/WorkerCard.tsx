import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown } from '../animations';
import { spacing, borderRadius } from '../../theme';
import { useColors, useShadows } from '../../store/themeStore';
import type { Worker } from '../../types';

type WorkerCardProps = {
  worker: Worker;
  index?: number;
  onExpand?: (worker: Worker) => void;
  onTransaction?: (worker: Worker) => void;
  onAddBalance?: (worker: Worker) => void;
  isExpanded?: boolean;
};

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  index = 0,
  onExpand,
  onTransaction,
  onAddBalance,
  isExpanded = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const transactionCount = worker.transactions?.filter(t => t.type === 'TRANSACTION').length || 0;

  return (
    <FadeInDown delay={index * 50}>
      <View style={[styles.card, { backgroundColor: themeColors.card }, themeShadows.sm]}>
        <TouchableOpacity 
          style={styles.mainContent}
          onPress={() => onExpand?.(worker)}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: themeColors.primary[500] }]}>
            <Text style={styles.avatarText}>{worker.initials}</Text>
          </View>

          <View style={styles.info}>
            <Text
              style={[styles.name, { color: themeColors.text.primary }]}
              numberOfLines={1}
            >
              {worker.name}
            </Text>
            <View style={styles.meta}>
              <Text style={[styles.transactions, { color: themeColors.text.secondary }]}>
                {transactionCount} transacción{transactionCount !== 1 ? 'es' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                Saldo
              </Text>
              <Text style={[
                styles.statValue,
                { color: worker.balance < 0 ? themeColors.danger : themeColors.text.primary }
              ]}>
                ${Number(worker.balance).toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                Ganancia
              </Text>
              <Text style={[styles.statValue, { color: themeColors.success }]}>
                ${Number(worker.accumulatedProfit).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.expandIcon}>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={themeColors.text.secondary} 
            />
          </View>
        </TouchableOpacity>

        <View style={[styles.actions, { borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            testID="worker-transaction-button"
            onPress={() => onTransaction?.(worker)}
            style={[styles.actionButton, { backgroundColor: '#3B82F615' }]}
          >
            <Ionicons name="receipt-outline" size={18} color="#3B82F6" />
            <Text style={[styles.actionText, { color: '#3B82F6' }]}>Transacciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="worker-add-balance-button"
            onPress={() => onAddBalance?.(worker)}
            style={[styles.actionButton, { backgroundColor: '#10B98115' }]}
          >
            <Ionicons name="add-circle-outline" size={18} color="#10B981" />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Agregar Saldo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FadeInDown>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: themeColors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  transactions: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  expandIcon: {
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
