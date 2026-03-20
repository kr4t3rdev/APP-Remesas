import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';
import type { Worker, WorkerTransaction } from '../../types';

type WorkerExpandableRowProps = {
  worker: Worker;
};

export const WorkerExpandableRow: React.FC<WorkerExpandableRowProps> = ({ worker }) => {
  const themeColors = useColors();

  const transactions = worker.transactions || [];
  const balanceAddCount = transactions.filter(t => t.type === 'BALANCE_ADD').length;
  const transactionCount = transactions.filter(t => t.type === 'TRANSACTION').length;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Resumen */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.text.secondary }]}>
            Total Entregado
          </Text>
          <Text style={[styles.summaryValue, { color: themeColors.primary[500] }]}>
            ${Number(worker.totalDelivered).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.text.secondary }]}>
            Transacciones
          </Text>
          <Text style={[styles.summaryValue, { color: themeColors.text.primary }]}>
            {transactionCount}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.text.secondary }]}>
            Ganancias
          </Text>
          <Text style={[styles.summaryValue, { color: themeColors.success }]}>
            ${Number(worker.accumulatedProfit).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Lista de transacciones */}
      {transactions.length > 0 ? (
        <View style={styles.transactionsList}>
          <Text style={[styles.listTitle, { color: themeColors.text.secondary }]}>
            Historial
          </Text>
          {transactions.map((tx, idx) => (
            <TransactionItem key={tx.id} transaction={tx} index={idx} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: themeColors.text.tertiary }]}>
            Sin transacciones registradas
          </Text>
        </View>
      )}
    </View>
  );
};

type TransactionItemProps = {
  transaction: WorkerTransaction;
  index: number;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, index }) => {
  const themeColors = useColors();
  const isBalanceAdd = transaction.type === 'BALANCE_ADD';

  return (
    <View style={[styles.transactionItem, { borderTopColor: themeColors.border }]}>
      <View style={styles.txIconContainer}>
        <View style={[
          styles.txIcon,
          { backgroundColor: isBalanceAdd ? '#10B98115' : '#3B82F615' }
        ]}>
          <Ionicons
            name={isBalanceAdd ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={isBalanceAdd ? '#10B981' : '#3B82F6'}
          />
        </View>
      </View>

      <View style={styles.txInfo}>
        <Text style={[styles.txType, { color: themeColors.text.primary }]}>
          {isBalanceAdd ? 'Saldo agregado' : 'Transacción'}
        </Text>
        <Text style={[styles.txDate, { color: themeColors.text.tertiary }]}>
          {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        {transaction.description && (
          <Text style={[styles.txDescription, { color: themeColors.text.secondary }]}>
            {transaction.description}
          </Text>
        )}
      </View>

      <View style={styles.txAmounts}>
        <Text style={[
          styles.txAmount,
          { color: isBalanceAdd ? themeColors.success : themeColors.danger }
        ]}>
          {isBalanceAdd ? '+' : '-'}${Number(transaction.amount).toLocaleString()}
        </Text>
        {!isBalanceAdd && transaction.profit !== undefined && (
          <Text style={[styles.txProfit, { color: themeColors.success }]}>
            Ganancia: ${Number(transaction.profit).toLocaleString()}
          </Text>
        )}
        <Text style={[styles.txBalance, { color: themeColors.text.tertiary }]}>
          Saldo: ${Number(transaction.balanceAfter).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  transactionsList: {
    marginTop: spacing.xs,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  txIconContainer: {
    marginRight: spacing.sm,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 12,
    marginTop: 2,
  },
  txDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmounts: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txProfit: {
    fontSize: 11,
    marginTop: 2,
  },
  txBalance: {
    fontSize: 11,
    marginTop: 2,
  },
});
