import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Alert } from "../../utils/alert";
import { getCurrencyInfo } from "../../utils/currencyFlags";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { colors, spacing, borderRadius, shadows } from "../../theme";
import type { BankAccount, Currency } from "../../types";
import {
  useBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} from "../../modules/bank-accounts/application/useBankAccounts";
import { useCurrenciesQuery } from "../../modules/currencies/application/useCurrencies";

export const BankAccountsScreen: React.FC = () => {
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

  const bankAccountsQuery = useBankAccountsQuery();
  const currenciesQuery = useCurrenciesQuery();
  const createBankAccountMutation = useCreateBankAccountMutation();
  const updateBankAccountMutation = useUpdateBankAccountMutation();
  const deleteBankAccountMutation = useDeleteBankAccountMutation();

  const accounts = bankAccountsQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    currencyId: 0,
    accountNumber: "",
    initialBalance: "",
  });

  useEffect(() => {
    if (!formData.currencyId && currencies.length > 0) {
      setFormData((prev) => ({ ...prev, currencyId: currencies[0].id }));
    }
  }, [currencies, formData.currencyId]);

  const handleRefresh = async () => {
    await Promise.all([bankAccountsQuery.refetch(), currenciesQuery.refetch()]);
  };

  const openCreateModal = () => {
    if (currencies.length === 0) {
      Alert.alert(
        "Acción no permitida",
        "Debe agregar monedas antes de añadir cuentas bancarias.",
      );
      return;
    }
    setSelectedAccount(null);
    setIsEditing(false);
    setFormData({
      name: "",
      bankName: "",
      currencyId: currencies[0]?.id || 0,
      accountNumber: "",
      initialBalance: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsEditing(true);
    setFormData({
      name: account.name,
      bankName: account.bankName,
      currencyId: account.currencyId,
      accountNumber: account.accountNumber,
      initialBalance: "", // No se edita el saldo inicial
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.bankName ||
      !formData.currencyId ||
      !formData.accountNumber
    ) {
      Alert.alert("Error", "Complete todos los campos");
      return;
    }

    try {
      if (isEditing && selectedAccount) {
        await updateBankAccountMutation.mutateAsync({
          id: selectedAccount.id,
          data: {
            name: formData.name,
            bankName: formData.bankName,
            currencyId: formData.currencyId,
            accountNumber: formData.accountNumber,
          },
        });
        Alert.alert("Éxito", "Cuenta actualizada correctamente");
      } else {
        await createBankAccountMutation.mutateAsync({
          name: formData.name,
          bankName: formData.bankName,
          currencyId: formData.currencyId,
          accountNumber: formData.accountNumber,
          initialBalance: formData.initialBalance
            ? parseFloat(formData.initialBalance)
            : 0,
        });
        Alert.alert("Éxito", "Cuenta creada correctamente");
      }
      setModalVisible(false);
      setFormData({
        name: "",
        bankName: "",
        currencyId: 0,
        accountNumber: "",
        initialBalance: "",
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "No se pudo guardar la cuenta";
      Alert.alert("Error", Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDelete = (account: BankAccount) => {
    setConfirmModal({
      visible: true,
      title: "Eliminar Cuenta",
      message: `¿Está seguro de que desea eliminar la cuenta "${account.name}"?`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        try {
          await deleteBankAccountMutation.mutateAsync(account.id);
          Alert.alert("Éxito", "Cuenta eliminada correctamente");
        } catch (error) {
          Alert.alert("Error", "No se pudo eliminar la cuenta");
        }
      },
    });
  };

  const renderAccount = ({
    item,
    index,
  }: {
    item: BankAccount;
    index: number;
  }) => {
    const currencyInfo = getCurrencyInfo(item.currency.code);

    return (
      <FadeInDown delay={index * 50}>
        <TouchableOpacity
          style={styles.accountCard}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.accountIcon}>
                <Ionicons
                  name="business"
                  size={24}
                  color={colors.primary[600]}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={styles.accountBank}>{item.bankName}</Text>
              </View>
            </View>
            <View
              style={[
                styles.currencyBadge,
                { backgroundColor: currencyInfo.backgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.currencyBadgeText,
                  { color: currencyInfo.textColor },
                ]}
              >
                {currencyInfo.flag} {item.currency.code}
              </Text>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceValue}>
                {item.currency.symbol}
                {item.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            {/* Sparkline placeholder */}
            <View style={styles.sparklineContainer}>
              <View style={styles.sparklineLine} />
            </View>
          </View>

          <View style={styles.accountFooter}>
            <Text style={styles.accountNumber}>
              •••• {item.accountNumber.slice(-4)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>TOTAL NET CASH</Text>
          <View style={styles.headerAmountRow}>
            <Text style={styles.headerAmount}>
              ${" "}
              {accounts
                .reduce((acc, curr) => acc + curr.balance, 0)
                .toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </FadeIn>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAccount}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={bankAccountsQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="wallet-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyStateText}>No hay cuentas bancarias</Text>
            <Text style={styles.emptyStateSubtext}>
              Toca + para agregar una nueva cuenta
            </Text>
          </View>
        }
      />

      <ScaleIn delay={200}>
        <TouchableOpacity
          style={styles.fab}
          onPress={openCreateModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </ScaleIn>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Editar Cuenta" : "Nueva Cuenta"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Nombre de la cuenta"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="ej. Cuenta Principal"
              />

              <Input
                label="Nombre del banco"
                value={formData.bankName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, bankName: text }))
                }
                placeholder="ej. Banco Nacional"
              />

              <Input
                label="Número de cuenta"
                value={formData.accountNumber}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, accountNumber: text }))
                }
                placeholder="ej. 1234567890"
                keyboardType="numeric"
              />

              {!isEditing && (
                <Input
                  label="Saldo inicial"
                  value={formData.initialBalance}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, initialBalance: text }))
                  }
                  placeholder="ej. 1000"
                  keyboardType="numeric"
                />
              )}

              <Text style={styles.sectionLabel}>Moneda</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.currencyScroll}
              >
                {currencies.map((currency) => {
                  const currencyInfo = getCurrencyInfo(currency.code);
                  return (
                    <TouchableOpacity
                      key={currency.id}
                      style={[
                        styles.currencyButton,
                        formData.currencyId === currency.id &&
                          styles.currencyButtonActive,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          currencyId: currency.id,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.currencyButtonText,
                          formData.currencyId === currency.id &&
                            styles.currencyButtonTextActive,
                        ]}
                      >
                        {currencyInfo.flag} {currency.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Button
                title={
                  createBankAccountMutation.isPending ||
                  updateBankAccountMutation.isPending
                    ? "Guardando..."
                    : "Guardar"
                }
                onPress={handleSubmit}
                loading={
                  createBankAccountMutation.isPending ||
                  updateBankAccountMutation.isPending
                }
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  container: { flex: 1, backgroundColor: colors.background, paddingTop: -80 },
  header: { padding: spacing.xl, paddingBottom: spacing.md },
  headerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs,
  },
  headerAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -1,
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: { flex: 1, marginLeft: spacing.sm },
  accountName: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  accountBank: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  currencyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  balanceContainer: { flex: 1 },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 4,
  },
  sparklineContainer: { width: 60, height: 30, justifyContent: "center" },
  sparklineLine: {
    height: 2,
    backgroundColor: colors.primary[500],
    width: "100%",
    borderRadius: 1,
  },
  accountFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accountNumber: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  deleteButton: { padding: spacing.xs },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl * 2 },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "transparent" },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  currencyScroll: { marginBottom: spacing.md },
  currencyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  currencyButtonActive: { backgroundColor: colors.primary[500] },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  currencyButtonTextActive: { color: "#fff" },
  submitButton: { marginTop: spacing.md },
});
