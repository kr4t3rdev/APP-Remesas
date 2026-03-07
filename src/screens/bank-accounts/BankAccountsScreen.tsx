import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown, ScaleIn } from '../../components/animations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import type { BankAccount, Currency } from '../../types';
import {
  useBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} from '../../modules/bank-accounts/application/useBankAccounts';
import { useCurrenciesQuery } from '../../modules/currencies/application/useCurrencies';

export const BankAccountsScreen: React.FC = () => {
  const bankAccountsQuery = useBankAccountsQuery();
  const currenciesQuery = useCurrenciesQuery();
  const createBankAccountMutation = useCreateBankAccountMutation();
  const updateBankAccountMutation = useUpdateBankAccountMutation();
  const deleteBankAccountMutation = useDeleteBankAccountMutation();

  const accounts = bankAccountsQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bankName: '',
    currencyId: 0,
    accountNumber: '',
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
    setSelectedAccount(null);
    setIsEditing(false);
    setFormData({
      name: '',
      bankName: '',
      currencyId: currencies[0]?.id || 0,
      accountNumber: '',
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
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.bankName || !formData.currencyId || !formData.accountNumber) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    try {
      if (isEditing && selectedAccount) {
        await updateBankAccountMutation.mutateAsync({
          id: selectedAccount.id,
          data: formData,
        });
        Alert.alert('Éxito', 'Cuenta actualizada correctamente');
      } else {
        await createBankAccountMutation.mutateAsync(formData);
        Alert.alert('Éxito', 'Cuenta creada correctamente');
      }
      setModalVisible(false);
      setFormData({ name: '', bankName: '', currencyId: 0, accountNumber: '' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la cuenta');
    }
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      'Eliminar Cuenta',
      `¿Está seguro de que desea eliminar la cuenta "${account.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBankAccountMutation.mutateAsync(account.id);
              Alert.alert('Éxito', 'Cuenta eliminada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
          },
        },
      ]
    );
  };

  const renderAccount = ({ item, index }: { item: BankAccount; index: number }) => (
    <FadeInDown delay={index * 50}>
      <TouchableOpacity
        style={styles.accountCard}
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.accountHeader}>
          <View style={[styles.accountIcon, { backgroundColor: colors.primary[500] + '20' }]}>
            <Ionicons name="wallet" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{item.name}</Text>
            <Text style={styles.accountBank}>{item.bankName}</Text>
            <Text style={styles.accountNumber}>•••• {item.accountNumber.slice(-4)}</Text>
          </View>
          <View style={styles.accountBalance}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            <Text style={styles.balanceValue}>
              {item.currency.symbol} {item.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={styles.accountFooter}>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyBadgeText}>{item.currency.code}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </FadeInDown>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.title}>Cuentas Bancarias</Text>
          <Text style={styles.subtitle}>Gestiona tus cuentas bancarias</Text>
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
            <Ionicons name="wallet-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyStateText}>No hay cuentas bancarias</Text>
            <Text style={styles.emptyStateSubtext}>Toca + para agregar una nueva cuenta</Text>
          </View>
        }
      />

      <ScaleIn delay={200}>
        <TouchableOpacity style={styles.fab} onPress={openCreateModal} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </ScaleIn>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Nombre de la cuenta"
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="ej. Cuenta Principal"
              />

              <Input
                label="Nombre del banco"
                value={formData.bankName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, bankName: text }))}
                placeholder="ej. Banco Nacional"
              />

              <Input
                label="Número de cuenta"
                value={formData.accountNumber}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, accountNumber: text }))}
                placeholder="ej. 1234567890"
                keyboardType="numeric"
              />

              <Text style={styles.sectionLabel}>Moneda</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                {currencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.id}
                    style={[styles.currencyButton, formData.currencyId === currency.id && styles.currencyButtonActive]}
                    onPress={() => setFormData((prev) => ({ ...prev, currencyId: currency.id }))}
                  >
                    <Text style={[styles.currencyButtonText, formData.currencyId === currency.id && styles.currencyButtonTextActive]}>
                      {currency.symbol} {currency.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button
                title={createBankAccountMutation.isPending || updateBankAccountMutation.isPending ? 'Guardando...' : 'Guardar'}
                onPress={handleSubmit}
                loading={createBankAccountMutation.isPending || updateBankAccountMutation.isPending}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  accountHeader: { flexDirection: 'row', alignItems: 'center' },
  accountIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  accountInfo: { flex: 1, marginLeft: spacing.sm },
  accountName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  accountBank: { fontSize: 12, color: colors.text.secondary },
  accountNumber: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  accountBalance: { alignItems: 'flex-end' },
  balanceLabel: { fontSize: 11, color: colors.text.tertiary },
  balanceValue: { fontSize: 16, fontWeight: '700', color: colors.primary[500] },
  accountFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  currencyBadge: { backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.full },
  currencyBadgeText: { fontSize: 11, fontWeight: '600', color: colors.text.secondary },
  deleteButton: { padding: spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyStateText: { fontSize: 16, color: colors.text.secondary, marginTop: spacing.md, fontWeight: '500' },
  emptyStateSubtext: { fontSize: 14, color: colors.text.tertiary, marginTop: spacing.xs },
  fab: {
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
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm, marginTop: spacing.sm },
  currencyScroll: { marginBottom: spacing.md },
  currencyButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.surface, marginRight: spacing.sm },
  currencyButtonActive: { backgroundColor: colors.primary[500] },
  currencyButtonText: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  currencyButtonTextActive: { color: '#fff' },
  submitButton: { marginTop: spacing.md },
});
