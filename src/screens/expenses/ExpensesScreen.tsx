import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import type { Expense } from '../../types';
import { useExpensesQuery } from '../../modules/expenses/application/useExpenses';

const categoryIcons: Record<string, string> = {
  renta: 'home',
  servicios: 'bulb',
  salario: 'people',
  insumos: 'cube',
  otros: 'ellipsis-horizontal',
};

const categoryColors: Record<string, string> = {
  renta: colors.primary[500],
  servicios: colors.warning,
  salario: colors.success,
  insumos: colors.primary[300],
  otros: colors.text.secondary,
};

export const ExpensesScreen: React.FC = () => {
  const expensesQuery = useExpensesQuery();
  const expenses = expensesQuery.data ?? [];

  const handleRefresh = async () => {
    try {
      await expensesQuery.refetch();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    }
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: borderRadius.md,
            backgroundColor: (categoryColors[item.category] || colors.text.secondary) + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <Ionicons 
            name={(categoryIcons[item.category] || 'ellipsis-horizontal') as any} 
            size={22} 
            color={categoryColors[item.category] || colors.text.secondary} 
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
            {item.description}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
            {item.category} • {new Date(item.date).toLocaleDateString('es-ES')}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>
            - $ {Number(item.amount).toLocaleString()}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>
            {item.currency?.code}
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
        <Badge
          text={item.status === 'PENDIENTE' ? 'Pendiente' : 'Pagado'}
          variant={item.status === 'PENDIENTE' ? 'warning' : 'success'}
        />
        <TouchableOpacity onPress={() => Alert.alert('Reconciliar')}>
          <Text style={{ fontSize: 14, color: colors.primary[500], fontWeight: '500' }}>
            Reconciliar
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
          Gastos
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
          Control de gastos operativos
        </Text>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpense}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={expensesQuery.isRefetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ fontSize: 16, color: colors.text.secondary }}>
              No hay gastos registrados
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
          backgroundColor: colors.danger,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
        }}
        onPress={() => Alert.alert('Nuevo Gasto', 'Registrar gasto operativo')}
      >
        <Text style={{ fontSize: 28, color: '#fff' }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
