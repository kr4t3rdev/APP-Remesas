import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useShadows } from "../../store/themeStore";
import { useTransactionsQuery } from "../../modules/transactions/application/useTransactions";
import { useBankAccountsQuery } from "../../modules/bank-accounts/application/useBankAccounts";
import { useReconcileIncomeBulkMutation } from "../../modules/reconciliations/application/useReconciliations";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import { spacing, borderRadius, shadows } from "../../theme";
import type { Transaction, BankAccount } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigation } from "@react-navigation/native";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export const BulkReconciliationScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const navigation = useNavigation();

  // Queries
  const { data: transactions, isLoading: isLoadingTransactions } =
    useTransactionsQuery({
      type: "VENTA",
      status: "PENDIENTE",
    });

  const { data: bankAccounts, isLoading: isLoadingAccounts } =
    useBankAccountsQuery();

  // Mutations
  const reconcileMutation = useReconcileIncomeBulkMutation();

  // State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    number | null
  >(null);

  // Computed
  const totalSelectedAmount = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter((t) => selectedIds.includes(t.id))
      .reduce((sum, t) => sum + t.totalCup, 0);
  }, [transactions, selectedIds]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (!transactions) return;
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("Error", "Selecciona al menos una transacción");
      return;
    }
    if (!selectedBankAccountId) {
      Alert.alert("Error", "Selecciona una cuenta bancaria destino");
      return;
    }

    try {
      await reconcileMutation.mutateAsync({
        transactionIds: selectedIds,
        bankAccountId: selectedBankAccountId,
      });
      Alert.alert("Éxito", "Reconciliación masiva completada", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo completar la reconciliación");
    }
  };

  const renderTransactionItem = ({
    item,
    index,
  }: {
    item: Transaction;
    index: number;
  }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <FadeInDown delay={index * 30}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: themeColors.card,
              borderColor: isSelected
                ? themeColors.primary[500]
                : "transparent",
              borderWidth: 1,
            },
            themeShadows.sm,
          ]}
          onPress={() => handleToggleSelect(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardRow}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: themeColors.border,
                  backgroundColor: isSelected
                    ? themeColors.primary[500]
                    : "transparent",
                },
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.amountText,
                    { color: themeColors.text.primary },
                  ]}
                >
                  {item.currency?.symbol}{" "}
                  {item.amount.toLocaleString("es-CU", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <Text style={[styles.cupText, { color: themeColors.success }]}>
                  + ${" "}
                  {item.totalCup.toLocaleString("es-CU", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  CUP
                </Text>
              </View>
              <Text
                style={[styles.dateText, { color: themeColors.text.secondary }]}
              >
                {format(new Date(item.createdAt), "dd MMM, HH:mm", {
                  locale: es,
                })}
              </Text>
              {item.notes && (
                <Text
                  style={[
                    styles.notesText,
                    { color: themeColors.text.tertiary },
                  ]}
                  numberOfLines={1}
                >
                  {item.notes}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  const renderBankAccountItem = ({ item }: { item: BankAccount }) => {
    const isSelected = selectedBankAccountId === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.accountCard,
          {
            backgroundColor: isSelected
              ? themeColors.primary[50]
              : themeColors.card,
            borderColor: isSelected
              ? themeColors.primary[500]
              : themeColors.border,
          },
        ]}
        onPress={() => setSelectedBankAccountId(item.id)}
      >
        <View style={styles.accountIcon}>
          <Ionicons
            name="wallet-outline"
            size={24}
            color={
              isSelected ? themeColors.primary[500] : themeColors.text.secondary
            }
          />
        </View>
        <View>
          <Text
            style={[
              styles.accountName,
              {
                color: isSelected
                  ? themeColors.primary[700]
                  : themeColors.text.primary,
              },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[styles.accountBank, { color: themeColors.text.secondary }]}
          >
            {item.bankName}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={themeColors.primary[500]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={themeColors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          Reconciliación Masiva
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            1. Selecciona Ingresos
          </Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text
              style={[styles.linkText, { color: themeColors.primary[500] }]}
            >
              {selectedIds.length === (transactions?.length || 0)
                ? "Deseleccionar"
                : "Seleccionar Todo"}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isLoadingTransactions ? (
              <Text
                style={[
                  styles.emptyText,
                  { color: themeColors.text.secondary },
                ]}
              >
                No hay ingresos pendientes
              </Text>
            ) : (
              <ActivityIndicator color={themeColors.primary[500]} />
            )
          }
        />

        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            2. Cuenta Destino
          </Text>
        </View>

        <View style={styles.accountsList}>
          <FlatList
            horizontal
            data={bankAccounts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBankAccountItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              gap: spacing.sm,
            }}
          />
        </View>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: themeColors.card,
              borderTopColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                { color: themeColors.text.secondary },
              ]}
            >
              {selectedIds.length} seleccionados
            </Text>
            <Text style={[styles.summaryTotal, { color: themeColors.success }]}>
              Total: ${" "}
              {totalSelectedAmount.toLocaleString("es-CU", {
                minimumFractionDigits: 2,
              })}{" "}
              CUP
            </Text>
          </View>
          <Button
            title="Reconciliar Ingresos"
            onPress={handleSubmit}
            loading={reconcileMutation.isPending}
            disabled={selectedIds.length === 0 || !selectedBankAccountId}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cupText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  notesText: {
    fontSize: 12,
    marginTop: 2,
  },
  accountsList: {
    height: 100,
    marginBottom: spacing.md,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minWidth: 200,
    gap: spacing.sm,
  },
  accountIcon: {
    marginRight: spacing.xs,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "600",
  },
  accountBank: {
    fontSize: 12,
  },
  checkIcon: {
    marginLeft: "auto",
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 14,
  },
});
