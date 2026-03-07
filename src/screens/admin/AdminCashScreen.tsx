import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FadeIn, FadeInDown } from '../../components/animations';
import { useRegisterSubscriptionPaymentMutation } from '../../modules/subscriptions/application/useSubscriptions';
import { useBankAccountsQuery } from '../../modules/bank-accounts/application/useBankAccounts';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { BillingCycle } from '../../types';

export const AdminCashScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const paymentMutation = useRegisterSubscriptionPaymentMutation();
  const bankAccountsQuery = useBankAccountsQuery();

  const [form, setForm] = useState({
    userId: '',
    planId: '',
    userLicenseId: '',
    bankAccountId: '',
    amountUsd: '15',
    exchangeRateUsed: '',
    cycle: 'MONTHLY' as BillingCycle,
    notes: '',
  });

  const amountCup = Number(form.amountUsd || 0) * Number(form.exchangeRateUsed || 0);

  const handleSubmit = async () => {
    if (!form.userId || !form.planId || !form.amountUsd || !form.exchangeRateUsed) {
      Alert.alert('Error', 'Complete los campos obligatorios');
      return;
    }

    try {
      await paymentMutation.mutateAsync({
        userId: Number(form.userId),
        planId: Number(form.planId),
        userLicenseId: form.userLicenseId ? Number(form.userLicenseId) : undefined,
        bankAccountId: form.bankAccountId ? Number(form.bankAccountId) : undefined,
        cycle: form.cycle,
        amountUsd: Number(form.amountUsd),
        exchangeRateUsed: Number(form.exchangeRateUsed),
        notes: form.notes || undefined,
      });

      Alert.alert('Éxito', 'Pago de suscripción registrado y conciliado en caja');
      setForm((prev) => ({ ...prev, notes: '', exchangeRateUsed: '', userLicenseId: '' }));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo registrar el pago');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeIn>
          <View>
            <Text style={styles.title}>Caja Admin</Text>
            <Text style={styles.subtitle}>Servicio → Reconciliación de ingreso → Cuenta bancaria</Text>
          </View>
        </FadeIn>

        <FadeInDown delay={60}>
          <View style={styles.card}>
          <Input testID="cash-user-id-input" label="User ID" keyboardType="numeric" value={form.userId} onChangeText={(v) => setForm((p) => ({ ...p, userId: v }))} />
          <Input testID="cash-plan-id-input" label="Plan ID" keyboardType="numeric" value={form.planId} onChangeText={(v) => setForm((p) => ({ ...p, planId: v }))} containerStyle={{ marginTop: spacing.sm }} />
          <Input testID="cash-license-id-input" label="License ID (opcional)" keyboardType="numeric" value={form.userLicenseId} onChangeText={(v) => setForm((p) => ({ ...p, userLicenseId: v }))} containerStyle={{ marginTop: spacing.sm }} />
          <Input testID="cash-bank-account-id-input" label="Cuenta Bancaria ID (opcional)" keyboardType="numeric" value={form.bankAccountId} onChangeText={(v) => setForm((p) => ({ ...p, bankAccountId: v }))} containerStyle={{ marginTop: spacing.sm }} />
          <Input testID="cash-cycle-input" label="Ciclo" value={form.cycle} onChangeText={(v) => setForm((p) => ({ ...p, cycle: (v as BillingCycle) || 'MONTHLY' }))} containerStyle={{ marginTop: spacing.sm }} />
          <Input testID="cash-amount-usd-input" label="Monto USD" keyboardType="decimal-pad" value={form.amountUsd} onChangeText={(v) => setForm((p) => ({ ...p, amountUsd: v }))} containerStyle={{ marginTop: spacing.sm }} />
          <Input testID="cash-exchange-rate-input" label="Tasa de cambio usada" keyboardType="decimal-pad" value={form.exchangeRateUsed} onChangeText={(v) => setForm((p) => ({ ...p, exchangeRateUsed: v }))} containerStyle={{ marginTop: spacing.sm }} />
          <Input testID="cash-notes-input" label="Notas" value={form.notes} onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))} containerStyle={{ marginTop: spacing.sm }} />

          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Total CUP conciliado</Text>
            <Text testID="cash-total-cup-value" style={styles.summaryValue}>{amountCup.toLocaleString('es-CU', { minimumFractionDigits: 2 })}</Text>
          </View>

          <Button
            title={paymentMutation.isPending ? 'Procesando...' : 'Registrar cobro'}
            loading={paymentMutation.isPending}
            onPress={handleSubmit}
            style={{ marginTop: spacing.md }}
          />
          </View>
        </FadeInDown>

        <FadeInDown delay={120}>
          <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cuentas bancarias disponibles</Text>
          {(bankAccountsQuery.data ?? []).map((account) => (
            <View key={account.id} style={styles.bankRow}>
              <Text style={styles.bankName}>{account.name}</Text>
              <Text style={styles.bankMeta}>ID: {account.id} · Saldo: {Number(account.balance).toFixed(2)}</Text>
            </View>
          ))}
          {!bankAccountsQuery.data?.length && <Text style={styles.bankMeta}>No hay cuentas registradas</Text>}
          </View>
        </FadeInDown>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
    subtitle: { color: colors.text.secondary, marginTop: 4, marginBottom: spacing.md },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    summary: {
      marginTop: spacing.md,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.primary[500]}15`,
    },
    summaryLabel: { color: colors.text.secondary, marginBottom: 4 },
    summaryValue: { color: colors.primary[600], fontWeight: '700', fontSize: 20 },
    sectionTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
    bankRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    bankName: { color: colors.text.primary, fontWeight: '600' },
    bankMeta: { color: colors.text.secondary, marginTop: 2 },
  });
