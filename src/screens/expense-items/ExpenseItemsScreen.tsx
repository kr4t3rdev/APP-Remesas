import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown, StaggerList } from "../../components/animations";
import { CategoryTooltip } from "../../components/expense-items/CategoryTooltip";
import { ExpenseItemFormModal } from "../../components/expense-items/ExpenseItemFormModal";
import { ExpenseItemCard } from "../../components/expense-items/ExpenseItemCard";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type {
  ExpenseItem,
  CreateExpenseItemInput,
  UpdateExpenseItemInput,
} from "../../types";
import {
  useExpenseItemsQuery,
  useCategoriesQuery,
  useCreateExpenseItemMutation,
  useUpdateExpenseItemMutation,
  useDeleteExpenseItemMutation,
} from "../../modules/expense-items/application/useExpenseItems";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";

export const ExpenseItemsScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();

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

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  const expenseItemsQuery = useExpenseItemsQuery();
  const categoriesQuery = useCategoriesQuery();
  const createMutation = useCreateExpenseItemMutation();
  const updateMutation = useUpdateExpenseItemMutation();
  const deleteMutation = useDeleteExpenseItemMutation();

  const expenseItems = expenseItemsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const totalAmount = useMemo(() => {
    return expenseItems.reduce((acc, item) => acc + parseFloat(item.amount), 0);
  }, [expenseItems]);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        expenseItemsQuery.refetch(),
        categoriesQuery.refetch(),
      ]);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los gastos");
    }
  };

  const handleCreateItem = async (data: CreateExpenseItemInput) => {
    await createMutation.mutateAsync(data);
    Alert.alert("Éxito", "Gasto creado correctamente");
  };

  const handleUpdateItem = async (data: CreateExpenseItemInput) => {
    if (!editingItem) return;
    await updateMutation.mutateAsync({
      id: editingItem.id,
      data: {
        name: data.name,
        amount: data.amount,
        category: data.category,
      },
    });
    Alert.alert("Éxito", "Gasto actualizado correctamente");
  };

  const handleDeleteItem = (item: ExpenseItem) => {
    setConfirmModal({
      visible: true,
      title: "Eliminar Ítem",
      message: `¿Estás seguro de eliminar "${item.name}"? Esta acción no se puede deshacer.`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        try {
          await deleteMutation.mutateAsync(item.id);
          Alert.alert("Éxito", "Ítem eliminado correctamente");
        } catch {
          Alert.alert("Error", "No se pudo eliminar el ítem");
        }
      },
    });
  };

  const handleEditItem = (item: ExpenseItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const formattedTotal = `$${totalAmount.toLocaleString("es-MX")}`;

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
              Elementos de gasto operativos
            </Text>
          </View>
        </FadeInDown>
      </View>

      <FadeInDown delay={50}>
        <View style={styles.statsCard}>
          <View
            style={[
              styles.totalCard,
              { backgroundColor: themeColors.card },
              themeShadows.sm,
            ]}
          >
            <View
              style={[
                styles.totalIcon,
                { backgroundColor: `${themeColors.danger}15` },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={20}
                color={themeColors.danger}
              />
            </View>
            <View style={styles.totalInfo}>
              <Text
                style={[
                  styles.totalLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Total Gastos
              </Text>
              <Text style={[styles.totalValue, { color: themeColors.danger }]}>
                {formattedTotal}
              </Text>
            </View>
          </View>
        </View>
      </FadeInDown>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: themeColors.text.primary }]}>
          {expenseItems.length} elemento{expenseItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={expenseItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <ExpenseItemCard
            expenseItem={item}
            index={index}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={expenseItemsQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
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
        testID="add-expense-item-fab"
        style={[
          styles.fab,
          { backgroundColor: themeColors.primary[500] },
          themeShadows.lg,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <CategoryTooltip />

      <ExpenseItemFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
        expense={editingItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
        categories={categories}
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
  statsCard: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  totalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  listHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 160,
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
    textAlign: "center",
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
