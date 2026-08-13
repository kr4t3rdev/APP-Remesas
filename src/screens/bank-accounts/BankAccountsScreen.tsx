import React, { useState, useRef } from "react";
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
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Alert } from "../../utils/alert";
import { getCurrencyInfo } from "../../utils/currencyFlags";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { spacing } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { BankAccount, Currency } from "../../types";
import {
  useBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} from "../../modules/bank-accounts/application/useBankAccounts";
import { useCurrenciesWithPrimaryQuery } from "../../modules/currencies/application/useCurrencies";
import { ProfileFeatureBackButton } from "../profile/ProfileFeatureBackButton";
import { BREAKPOINTS } from "../../hooks/useResponsive";

type ConfirmAction = () => Promise<void>;

export const BankAccountsScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;
  const confirmAction = useRef<ConfirmAction>(async () => {});

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmVariant, setConfirmVariant] = useState<"danger" | "primary" | "warning">("danger");

  const bankAccountsQuery = useBankAccountsQuery();
  const currenciesQuery = useCurrenciesWithPrimaryQuery();
  const createBankAccountMutation = useCreateBankAccountMutation();
  const updateBankAccountMutation = useUpdateBankAccountMutation();
  const deleteBankAccountMutation = useDeleteBankAccountMutation();

  const accounts = bankAccountsQuery.data ?? [];
  const currencies = currenciesQuery.data?.currencies ?? [];
  const primaryCurrency = currencies.find(
    (currency) => currency.id === currenciesQuery.data?.primaryCurrencyId,
  );
  const availableCurrencies = currencies.filter(
    (c) => c.isActive !== false,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const isEditing = selectedAccount !== null;

  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    currencyId: null as number | null,
    accountNumber: "",
    initialBalance: "",
  });

  const handleRefresh = async () => {
    await Promise.all([bankAccountsQuery.refetch(), currenciesQuery.refetch()]);
  };

  const openCreateModal = () => {
    if (availableCurrencies.length === 0) {
      Alert.alert(
        "Error",
        "Debe agregar monedas antes de añadir cuentas bancarias",
      );
      return;
    }

    setSelectedAccount(null);
    setFormData({
      name: "",
      bankName: "",
      currencyId: availableCurrencies[0]?.id ?? null,
      accountNumber: "",
      initialBalance: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      bankName: account.bankName,
      currencyId: account.currencyId,
      accountNumber: account.accountNumber,
      initialBalance: "",
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
      if (isEditing) {
        await updateBankAccountMutation.mutateAsync({
          id: selectedAccount!.id,
          data: {
            name: formData.name,
            bankName: formData.bankName,
            currencyId: formData.currencyId!,
            accountNumber: formData.accountNumber,
          },
        });
        Alert.alert("Éxito", "Cuenta actualizada correctamente");
      } else {
        await createBankAccountMutation.mutateAsync({
          name: formData.name,
          bankName: formData.bankName,
          currencyId: formData.currencyId!,
          accountNumber: formData.accountNumber,
          initialBalance: formData.initialBalance
            ? parseFloat(formData.initialBalance)
            : 0,
        });
        Alert.alert("Éxito", "Cuenta creada correctamente");
      }
      setModalVisible(false);
      setSelectedAccount(null);
      setFormData({
        name: "",
        bankName: "",
        currencyId: null,
        accountNumber: "",
        initialBalance: "",
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "No se pudo guardar la cuenta";
      Alert.alert("Error", Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDelete = (account: BankAccount) => {
    confirmAction.current = async () => {
      try {
        await deleteBankAccountMutation.mutateAsync(account.id);
        Alert.alert("Éxito", "Cuenta eliminada correctamente");
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "No se pudo eliminar la cuenta";
        Alert.alert("Error", Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      }
    };
    setConfirmTitle("Eliminar Cuenta");
    setConfirmMessage(`¿Está seguro de que desea eliminar la cuenta "${account.name}"?`);
    setConfirmVariant("danger");
    setConfirmVisible(true);
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
          style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.accountIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons
                  name="business"
                  size={20}
                  color={colors.primary[600]}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: colors.text.primary }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.accountBank, { color: colors.text.secondary }]} numberOfLines={1}>{item.bankName}</Text>
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
              <Text style={[styles.balanceLabel, { color: colors.text.tertiary }]}>DISPONIBLE</Text>
              <Text style={[styles.balanceValue, { color: colors.text.primary }]}>
                {item.currency.symbol}
                {item.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          <View style={[styles.accountFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.accountNumber, { color: colors.text.tertiary }]}>
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

  const totalsByCurrency = accounts.reduce<Record<string, { symbol: string; code: string; balance: number }>>(
    (acc, account) => {
      const code = account.currency.code;
      if (!acc[code]) {
        acc[code] = { symbol: account.currency.symbol, code, balance: 0 };
      }
      acc[code].balance += account.balance;
      return acc;
    },
    {},
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileFeatureBackButton />
      <FadeIn>
        <View style={[styles.header, isWebDesktop && styles.webHeader]}>
          <View style={isWebDesktop ? styles.webHeaderGroup : undefined}>
            <Text style={[styles.headerLabel, { color: colors.text.tertiary }]}>Net Cash</Text>
            <View style={styles.headerAmountRow}>
              {Object.values(totalsByCurrency).length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Object.values(totalsByCurrency).map(({ symbol, code, balance }) => (
                    <View key={code} style={styles.headerCurrencyGroup}>
                      <Text style={[styles.headerAmount, { color: colors.text.primary }]}>
                        {symbol}
                        {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Text>
                      <Text style={[styles.headerCurrencyLabel, { color: colors.text.secondary }]}>
                        {code}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={[styles.headerAmount, { color: colors.text.primary }]}>
                  {primaryCurrency?.symbol || primaryCurrency?.code || ""}{primaryCurrency ? " " : ""}0.00
                </Text>
              )}
            </View>
          </View>
          {isWebDesktop ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Nueva cuenta"
              onPress={openCreateModal}
              style={[
                styles.headerAction,
                { backgroundColor: colors.primary[500] },
              ]}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.headerActionText}>Nueva cuenta</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </FadeIn>

      {bankAccountsQuery.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAccount}
          contentContainerStyle={[styles.listContent, isWebDesktop && styles.webListContent]}
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
              <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
                No hay cuentas bancarias
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.text.tertiary }]}>
                Toca + para agregar una nueva cuenta
              </Text>
            </View>
          }
        />
      )}

      <ScaleIn delay={200}>
        {!isWebDesktop ? (
          <TouchableOpacity
            style={[styles.fab, shadows.lg, { backgroundColor: colors.primary[500] }]}
            onPress={openCreateModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </ScaleIn>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedAccount(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              setSelectedAccount(null);
            }}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {isEditing ? "Editar Cuenta" : "Nueva Cuenta"}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setSelectedAccount(null);
              }}>
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
                  placeholder="ej. 1000.00"
                  keyboardType="decimal-pad"
                />
              )}

              {availableCurrencies.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>Moneda</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.currencyScroll}
                  >
                    {availableCurrencies.map((currency) => {
                      const currencyInfo = getCurrencyInfo(currency.code);
                      return (
                        <TouchableOpacity
                          key={currency.id}
                          style={[
                            styles.currencyButton,
                            { backgroundColor: colors.surface },
                            formData.currencyId === currency.id &&
                              { backgroundColor: colors.primary[500] },
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
                              { color: colors.text.primary },
                              formData.currencyId === currency.id &&
                                styles.currencyButtonTextActive,
                            ]}
                          >
                            {currencyInfo.flag} {currency.symbol} {currency.code}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}

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
        visible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        variant={confirmVariant}
        onConfirm={confirmAction.current}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  webHeader: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  webHeaderGroup: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
  },
  headerActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  headerCurrencyGroup: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: spacing.lg,
  },
  headerAmount: {
    fontSize: 32,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  headerCurrencyLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  webListContent: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  accountCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: { flex: 1, marginLeft: spacing.sm },
  accountName: { fontSize: 15, fontWeight: "700" },
  accountBank: { fontSize: 12, marginTop: 2 },
  currencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: spacing.sm,
  },
  currencyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  balanceContainer: { flex: 1 },
  balanceLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginTop: 4,
  },
  accountFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  accountNumber: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  deleteButton: { padding: spacing.xs },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl * 2 },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.md,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.01)" },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  modalTitle: { fontSize: 20, fontWeight: "700" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  currencyScroll: { marginBottom: spacing.md },
  currencyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginRight: spacing.sm,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  currencyButtonTextActive: { color: "#fff" },
  submitButton: { marginTop: spacing.md },
});