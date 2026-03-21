import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useBankAccounts } from '../../../hooks/queries/useBusinessQueries';
import { useColors } from '../../../store/themeStore';

export const BanksTab = () => {
  const { data: banks, isLoading } = useBankAccounts();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!banks || banks.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text.secondary }}>No hay cuentas bancarias</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={banks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>{item.name} - {item.bankName}</Text>
            <Text style={{ color: colors.text.secondary }}>Saldo: ${item.balance} {item.currencyCode}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16, margin: 8, borderRadius: 8, elevation: 2 },
});
