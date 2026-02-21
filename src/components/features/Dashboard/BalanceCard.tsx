import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../ui/Card';
import { colors, spacing } from '../../../theme';
import type { CashBalance } from '../../../types';

type BalanceCardProps = {
  balances: CashBalance[];
};

export const BalanceCard: React.FC<BalanceCardProps> = ({ balances }) => {
  return (
    <Card title="Saldos en Caja">
      {balances.map((balance, index) => (
        <View
          key={balance.id}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            borderBottomWidth: index < balances.length - 1 ? 1 : 0,
            borderBottomColor: colors.separator,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: colors.text.primary }}>
              {balance.currency?.code}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary, marginLeft: 8 }}>
              {balance.currency?.name}
            </Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
            {balance.currency?.symbol} {balance.balance.toLocaleString()}
          </Text>
        </View>
      ))}
    </Card>
  );
};
