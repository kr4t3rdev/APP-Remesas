import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../../types/business';

interface Props {
  transaction: Transaction;
}

export const TransactionCard = ({ transaction }: Props) => {
  const colors = useColors();
  const isBuy = transaction.type === 'BUY';
  const isReconciled = transaction.status === 'RECONCILED';

  const iconName = isBuy ? 'swap-horizontal' : 'sync';
  const iconColor = isBuy ? '#10B981' : '#EF4444';
  const iconBgColor = isBuy ? '#D1FAE5' : '#FEE2E2';

  const title = isBuy ? 'Currency Exchange' : 'Market Liquidation';
  const dateFormatted = 'Oct 24, 2023 • 09:42 AM'; // mock, en real se formatea transaction.date
  
  const amountStr = `${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${transaction.sourceCurrency}`;
  const rateStr = `${transaction.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${transaction.targetCurrency}`;
  const totalStr = `${(transaction.amount * transaction.rate).toLocaleString('en-US', { minimumFractionDigits: 0 })} ${transaction.targetCurrency}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
            <View style={[styles.badge, { backgroundColor: isBuy ? '#D1FAE5' : '#FEE2E2' }]}>
              <Text style={[styles.badgeText, { color: isBuy ? '#065F46' : '#991B1B' }]}>{transaction.type}</Text>
            </View>
          </View>
          <Text style={[styles.date, { color: colors.text.secondary }]}>{dateFormatted}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>AMOUNT</Text>
          <Text style={[styles.value, { color: colors.text.primary }]}>{amountStr}</Text>
        </View>
        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>RATE</Text>
          <Text style={[styles.value, { color: colors.text.primary }]}>{rateStr}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>TOTAL</Text>
          <Text style={styles.totalValue}>{totalStr}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isReconciled ? '#E5E7EB' : '#FECACA' }]}>
          <Text style={[styles.statusText, { color: isReconciled ? '#374151' : '#991B1B' }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  date: {
    fontSize: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB', // Azul fuerte
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
