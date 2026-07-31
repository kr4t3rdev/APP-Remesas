import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../../components/animations";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { ExpenseCard } from "../../components/expenses/ExpenseCard";
import { ExpenseFormModal } from "../../components/expenses/ExpenseFormModal";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";
import { useTabBarScrollBehavior, useTabScrollToTop } from "../../navigation/TabBarMotionProvider";
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
} from "../../types";
import {
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../../modules/expenses/application/useExpenses";

const CATEGORIES: {
  id: ExpenseCategory | "all";
  label: string;
  icon: string;
}[] = [
  { id: "all", label: "Todos", icon: "apps" },
  { id: "renta", label: "Renta", icon: "home" },
  { id: "servicios", label: "Servicios", icon: "bulb" },
  { id: "salario", label: "Salario", icon: "people" },
  { id: "insumos", label: "Insumos", icon: "cube" },
  { id: "otros", label: "Otros", icon: "ellipsis-horizontal" },
];

export const ExpensesScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const tabBarScrollBehavior = useTabBarScrollBehavior();
  const expensesListRef = useRef<FlatList<Expense>>(null);
  const scrollToTop = useCallback(() => {
    expensesListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
  useTabScrollToTop("Expenses", scrollToTop);

  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategory | "all"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "primary" | "warning";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const expensesQuery = useExpensesQuery(
    selectedCategory !== "all" ? { category: selectedCategory } : undefined,
  );
  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();

  const expenses = expensesQuery.data ?? [];
  const filteredExpenses = expenses;
  const totalsByCurrency = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
    const code = expense.currency?.code ?? "???";
    acc[code] = (acc[code] ?? 0) + Number(expense.amount);
    return acc;
  }, {});
  const hasTotals = Object.keys(totalsByCurrency).length > 0;

  const handleRefresh = async () => {
    try {
      await expensesQuery.refetch();
    } catch {
      Alert.alert("Error", "No se pudieron cargar los gastos");
    }
  };

  const handleCreateExpense = async (
    data: CreateExpenseInput | UpdateExpenseInput,
  ) => {
    try {
      await createMutation.mutateAsync(data as CreateExpenseInput);
      Alert.alert("Éxito", "Gasto creado correctamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudo guardar el gasto";
      Alert.alert("Error", message);
      throw error;
    }
  };

  const handleUpdateExpense = async (
    data: CreateExpenseInput | UpdateExpenseInput,
  ) => {
    if (!editingExpense) return;
    try {
      await updateMutation.mutateAsync({ id: editingExpense.id, data });
      Alert.alert("Éxito", "Gasto actualizado correctamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudo actualizar el gasto";
      Alert.alert("Error", message);
      throw error;
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    setConfirmModal({
      visible: true,
      title: "Eliminar Gasto",
      message: "¿Estás seguro de que deseas eliminar este gasto?",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        try {
          await deleteMutation.mutateAsync(expense.id);
          Alert.alert("Éxito", "Gasto eliminado correctamente");
        } catch (error: any) {
          const message =
            error?.response?.data?.message ??
            error?.message ??
            "No se pudo eliminar el gasto";
          Alert.alert("Error", message);
        }
      },
    });
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.header}>
        <FadeInDown delay={0}>
          <View>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Gastos
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.text.secondary }]}
            >
              Control de gastos operativos
            </Text>
          </View>
        </FadeInDown>
      </View>

      <FadeInDown delay={50}>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.card },
              themeShadows.sm,
            ]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${themeColors.danger}15` },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={20}
                color={themeColors.danger}
              />
            </View>
            <View style={styles.statInfo}>
              <Text
                style={[
                  styles.statLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Total Gastos
              </Text>
              {!hasTotals ? (
                <Text style={[styles.statValue, { color: themeColors.danger }]}>
                  Sin gastos
                </Text>
              ) : (
                Object.entries(totalsByCurrency).map(([code, amount]) => (
                  <Text
                    key={code}
                    testID={`expense-total-${code}`}
                    style={[styles.statValue, { color: themeColors.danger }]}
                  >
                    {code} {amount.toLocaleString()}
                  </Text>
                ))
              )}
            </View>
          </View>
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
                    !isSelected && {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? "#fff" : themeColors.text.secondary}
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

        </View>
      </FadeInDown>

      <FlatList
        ref={expensesListRef}
        {...tabBarScrollBehavior}
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <ExpenseCard
            expense={item}
            index={index}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
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
         onEndReached={() => {
           if (expensesQuery.hasNextPage && !expensesQuery.isFetchingNextPage) {
             void expensesQuery.fetchNextPage();
           }
         }}
         onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={themeColors.text.tertiary}
            />
            <Text
              style={[styles.emptyTitle, { color: themeColors.text.primary }]}
            >
              No hay gastos registrados
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: themeColors.text.secondary },
              ]}
            >
              Toca el botón + para registrar un nuevo gasto
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        testID="add-expense-fab"
        style={[
          styles.fab,
          { backgroundColor: themeColors.danger },
          themeShadows.lg,
        ]}
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

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, visible: false }))
        }
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
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "700",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  pendingFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
    marginLeft: spacing.sm,
  },
  pendingFilterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  fab: {
    position: "absolute",
    bottom: floatingTabBarMetrics.standaloneActionBottom,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
