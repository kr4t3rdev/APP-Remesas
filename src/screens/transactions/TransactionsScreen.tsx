import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Badge } from '../../components/ui/Badge';
import { transactionService } from '../../services/finance.service';
import type { Transaction } from '../../types';

type FilterType = 'all' | 'COMPRA' | 'VENTA';

export const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadTransactions = async () => {
    try {
      const params = filter === 'all' ? {} : { type: filter };
      const data = await transactionService.getAll(params);
      setTransactions(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCompra = item.type === 'COMPRA';
    
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
          ...shadows.sm,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: borderRadius.md,
                  backgroundColor: isCompra ? colors.primary[100] : colors.success + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 18 }}>{isCompra ? '💰' : '💸'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                  {isCompra ? 'Compra' : 'Venta'} - {item.currency?.code}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                  {new Date(item.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
              {item.currency?.symbol} {Number(item.amount).toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
              @ {Number(item.rate).toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.sm,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.separator,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
            Total: $ {Number(item.totalCup).toLocaleString()} CUP
          </Text>
          <Badge
            text={item.status === 'PENDIENTE' ? 'Pendiente' : 'Reconciliado'}
            variant={item.status === 'PENDIENTE' ? 'warning' : 'success'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'COMPRA', label: 'Compras' },
    { key: 'VENTA', label: 'Ventas' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
          Transacciones
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
          Historial de compras y ventas
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: borderRadius.full,
              backgroundColor: filter === f.key ? colors.primary[500] : colors.card,
              marginRight: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: filter === f.key ? '#fff' : colors.text.secondary,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ fontSize: 16, color: colors.text.secondary }}>
              No hay transacciones
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: spacing.lg,
          right: spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary[500],
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
        }}
        onPress={() => Alert.alert('Nueva Transacción', 'Crear compra o venta')}
      >
        <Text style={{ fontSize: 28, color: '#fff' }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
