import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useTransactions } from '../../../hooks/queries/useBusinessQueries';
import { useColors } from '../../../store/themeStore';
import { TransactionModal } from '../../../components/business/modals/TransactionModal';
import { TransactionCard } from '../components/TransactionCard';
import { Ionicons } from '@expo/vector-icons';

export const TransactionsTab = () => {
  const { data: transactions, isLoading } = useTransactions();
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {(!transactions || transactions.length === 0) ? (
        <View style={styles.center}>
          <Text style={{ color: colors.text.secondary }}>No hay transacciones registradas</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary[500] }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16, margin: 8, borderRadius: 8, elevation: 2 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
