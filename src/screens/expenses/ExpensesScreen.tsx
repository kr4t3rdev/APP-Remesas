import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown } from '../../components/animations';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';
import { ExpenseFormModal } from '../../components/expenses/ExpenseFormModal';
import { spacing, borderRadius } from '../../theme';
import { useColors, useShadows } from '../../store/themeStore';
import type { Expense, ExpenseCategory, CreateExpenseInput } from '../../types';
import {
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../../modules/expenses/application/useExpenses';

const CATEGORIES: { id: ExpenseCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'renta', label: 'Renta', icon: 'home' },
  { id: 'servicios', label: 'Servicios', icon: 'bulb' },
  { id: 'salario', label: 'Salario', icon: 'people' },
  { id: 'insumos', label: 'Insumos', icon: 'cube' },
  { id: 'otros', label: 'Otros', icon: 'ellipsis-horizontal' },
];

export const ExpensesScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showPending, setShowPending] = useState(false);

  const expensesQuery = useExpensesQuery(
    selectedCategory !== 'all' ? { category: selectedCategory } : undefined
  );
  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();

  const expenses = expensesQuery.data ?? [];
  const filteredExpenses = useMemo(() => {
    if (showPending) {
      return expenses.filter((e) => e.status === 'PENDIENTE');
    }
    return expenses;
  }, [expenses, showPending]);

  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const pendingCount = expenses.filter((e) => e.status === 'PENDIENTE').length;

  const handleRefresh = async () => {
    try {
      await expensesQuery.refetch();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    }
  };

  const handleCreateExpense = async (data: CreateExpenseInput) => {
    await createMutation.mutateAsync(data);
    Alert.alert('Éxito', 'Gasto creado correctamente');
  };

  const handleUpdateExpense = async (data: CreateExpenseInput) => {
    if (!editingExpense) return;
    await updateMutation.mutateAsync({ id: editingExpense.id, data });
    Alert.alert('Éxito', 'Gasto actualizado correctamente');
  };

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      await deleteMutation.mutateAsync(expense.id);
      Alert.alert('Éxito', 'Gasto eliminado correctamente');
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el gasto');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleReconcileExpense = (expense: Expense) => {
    Alert.alert(
      'Reconciliar Gasto',
      `¿Marcar "${expense.description}" como pagado?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateMutation.mutateAsync({
                id: expense.id,
                data: { notes: expense.notes || 'Reconciliado' },
              });
              Alert.alert('Éxito', 'Gasto marcado como pagado');
            } catch {
              Alert.alert('Error', 'No se pudo reconciliar el gasto');
            }
          },
        },
      ]
    );
  };

  const handleOpenModal = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const statsData = [
    {
      label: 'Total Gastos',
      value: `$ ${totalExpenses.toLocaleString()}`,
      color: themeColors.danger,
      icon: 'wallet-outline' as const,
    },
    {
      label: 'Pendientes',
      value: pendingCount.toString(),
      color: themeColors.warning,
      icon: 'time-outline' as const,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <FadeInDown delay={0}>
          <View>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>Gastos</Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Control de gastos operativos
            </Text>
          </View>
        </FadeInDown>
      </View>

      <FadeInDown delay={50}>
        <View style={styles.statsRow}>
          {statsData.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: themeColors.card }, themeShadows.sm]}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                  {stat.label}
                </Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </FadeInDown>

      <FadeInDown delay={100}>
        <View style={styles.filtersRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  testID={`category-filter-${cat.id}`}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: themeColors.primary[500] },
                    !isSelected && { backgroundColor: themeColors.card, borderColor: themeColors.border },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? '#fff' : themeColors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && { color: themeColors.text.inverse },
                      !isSelected && { color: themeColors.text.secondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            testID="filter-pending-button"
            onPress={() => setShowPending(!showPending)}
            style={[
              styles.pendingFilter,
              showPending && { backgroundColor: themeColors.warning },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={16}
              color={showPending ? '#fff' : themeColors.warning}
            />
            <Text
              style={[
                styles.pendingFilterText,
                { color: showPending ? '#fff' : themeColors.warning },
              ]}
            >
              Pendientes
            </Text>
          </TouchableOpacity>
        </View>
      </FadeInDown>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <ExpenseCard
            expense={item}
            index={index}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onReconcile={handleReconcileExpense}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={expensesQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={themeColors.text.tertiary} />
            <Text style={[styles.emptyTitle, { color: themeColors.text.primary }]}>
              No hay gastos registrados
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.text.secondary }]}>
              Toca el botón + para registrar un nuevo gasto
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        testID="add-expense-fab"
        style={[styles.fab, { backgroundColor: themeColors.danger }, themeShadows.lg]}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ExpenseFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
        expense={editingExpense}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pendingFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
    marginLeft: spacing.sm,
  },
  pendingFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
