import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FadeIn, FadeInDown } from '../../components/animations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCreatePlanMutation, usePlansCatalogQuery } from '../../modules/plans/application/usePlans';
import { useAssignLicenseMutation, useSubscriptionLicensesQuery } from '../../modules/subscriptions/application/useSubscriptions';
import { useOperationalUsersQuery } from '../../modules/users/application/useUsers';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { BillingCycle, Plan } from '../../types';

const FIXED_PRICING = {
  monthlyUsd: 15,
  semiannualUsd: 85.5,
  annualUsd: 162,
} as const;

const CYCLE_OPTIONS: Array<{ label: string; value: BillingCycle }> = [
  { label: 'Mensual', value: 'MONTHLY' },
  { label: 'Semestral', value: 'SEMIANNUAL' },
  { label: 'Anual', value: 'ANNUAL' },
];

export const AdminServicesScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const usersQuery = useOperationalUsersQuery();
  const plansQuery = usePlansCatalogQuery();
  const licensesQuery = useSubscriptionLicensesQuery();

  const assignMutation = useAssignLicenseMutation();
  const createPlanMutation = useCreatePlanMutation();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [licenseErrors, setLicenseErrors] = useState<{ user?: string; plan?: string }>({});

  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    isActive: 'true',
  });

  const usersOptions = useMemo(
    () =>
      (usersQuery.data ?? []).map((user) => ({
        value: String(user.id),
        label: `${user.name || user.email}`,
        description: user.role,
      })),
    [usersQuery.data],
  );

  const plansOptions = useMemo(
    () =>
      (plansQuery.data ?? []).map((plan) => ({
        value: String(plan.id),
        label: plan.name,
        description: plan.isActive ? 'Activo' : 'Inactivo',
      })),
    [plansQuery.data],
  );

  const planById = useMemo(() => {
    return new Map<number, Plan>((plansQuery.data ?? []).map((plan) => [plan.id, plan]));
  }, [plansQuery.data]);

  const hasPartialDataFailure = usersQuery.isError || plansQuery.isError || licensesQuery.isError;

  const handleAssignLicense = async () => {
    const nextErrors: { user?: string; plan?: string } = {};

    if (!selectedUserId) nextErrors.user = 'Selecciona un usuario';
    if (!selectedPlanId) nextErrors.plan = 'Selecciona un plan';

    setLicenseErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await assignMutation.mutateAsync({
        userId: Number(selectedUserId),
        planId: Number(selectedPlanId),
        cycle,
      });
      Alert.alert('Éxito', 'Licencia asignada');
      setSelectedUserId('');
      setSelectedPlanId('');
      setCycle('MONTHLY');
      setLicenseErrors({});
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo asignar la licencia');
    }
  };

  const handleCreatePlan = async () => {
    if (!planForm.name.trim()) {
      Alert.alert('Error', 'El nombre del plan es obligatorio');
      return;
    }

    try {
      await createPlanMutation.mutateAsync({
        name: planForm.name.trim(),
        description: planForm.description.trim() || undefined,
        isActive: planForm.isActive === 'true',
        monthlyUsd: FIXED_PRICING.monthlyUsd,
        semiannualUsd: FIXED_PRICING.semiannualUsd,
        annualUsd: FIXED_PRICING.annualUsd,
      });

      Alert.alert('Éxito', 'Plan creado correctamente');
      setPlanForm({ name: '', description: '', isActive: 'true' });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo crear el plan');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeIn>
          <View>
            <Text style={styles.title}>Servicios</Text>
            <Text style={styles.subtitle}>Cockpit de licencias y planes para operación admin</Text>
          </View>
        </FadeIn>

        {hasPartialDataFailure ? (
          <View style={styles.partialWarning}>
            <Text style={styles.partialWarningTitle}>Datos parciales disponibles</Text>
            <Text style={styles.partialWarningText}>
              Una o más fuentes fallaron. Puedes seguir operando con los bloques cargados.
            </Text>
          </View>
        ) : null}

        <FadeInDown delay={40}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gestión de licencia</Text>

            <Select
              testID="services-user-select"
              label="Usuario"
              value={selectedUserId}
              onValueChange={(value) => {
                setSelectedUserId(value);
                setLicenseErrors((prev) => ({ ...prev, user: undefined }));
              }}
              options={usersOptions}
              loading={usersQuery.isLoading}
              error={licenseErrors.user ?? (usersQuery.isError ? 'No se pudo cargar usuarios' : null)}
              emptyText="No hay usuarios disponibles"
              containerStyle={styles.blockSpacing}
            />

            <Select
              testID="services-plan-select"
              label="Plan"
              value={selectedPlanId}
              onValueChange={(value) => {
                setSelectedPlanId(value);
                setLicenseErrors((prev) => ({ ...prev, plan: undefined }));
              }}
              options={plansOptions}
              loading={plansQuery.isLoading}
              error={licenseErrors.plan ?? (plansQuery.isError ? 'No se pudo cargar planes' : null)}
              emptyText="No hay planes disponibles"
              containerStyle={styles.blockSpacing}
            />

            <Select
              testID="services-cycle-select"
              label="Ciclo"
              value={cycle}
              onValueChange={(value) => setCycle(value as BillingCycle)}
              options={CYCLE_OPTIONS}
              containerStyle={styles.blockSpacing}
            />

            <Button
              testID="services-assign-license-button"
              title={assignMutation.isPending ? 'Asignando...' : 'Asignar licencia'}
              loading={assignMutation.isPending}
              onPress={handleAssignLicense}
              style={styles.blockSpacing}
            />
          </View>
        </FadeInDown>

        <FadeInDown delay={80}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear plan</Text>

            <Input
              testID="services-create-plan-name"
              label="Nombre"
              value={planForm.name}
              onChangeText={(value) => setPlanForm((prev) => ({ ...prev, name: value }))}
              placeholder="Ej: Plan Profesional"
            />

            <Input
              testID="services-create-plan-description"
              label="Descripción"
              value={planForm.description}
              onChangeText={(value) => setPlanForm((prev) => ({ ...prev, description: value }))}
              placeholder="Opcional"
              containerStyle={styles.blockSpacing}
            />

            <Select
              testID="services-create-plan-active"
              label="Estado"
              value={planForm.isActive}
              onValueChange={(value) => setPlanForm((prev) => ({ ...prev, isActive: value }))}
              options={[
                { value: 'true', label: 'Activo', description: 'Disponible para asignar' },
                { value: 'false', label: 'Inactivo', description: 'No asignable' },
              ]}
              containerStyle={styles.blockSpacing}
            />

            <View style={[styles.pricingCard, styles.blockSpacing]}>
              <Text style={styles.pricingTitle}>Pricing fijo (USD)</Text>
              <Text style={styles.pricingText}>Mensual: 15.00 · Semestral: 85.50 · Anual: 162.00</Text>
              <Text style={styles.pricingHint}>Sin prorrateo ni impuestos</Text>
            </View>

            <Button
              testID="services-create-plan-button"
              title={createPlanMutation.isPending ? 'Creando...' : 'Crear plan'}
              loading={createPlanMutation.isPending}
              onPress={handleCreatePlan}
            />
          </View>
        </FadeInDown>

        <FadeInDown delay={120}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Catálogo de planes</Text>
            {plansQuery.isError ? (
              <Text style={styles.errorText}>No se pudo cargar el catálogo de planes.</Text>
            ) : null}

            {(plansQuery.data ?? []).map((plan) => (
              <View key={plan.id} style={styles.listRow}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{plan.name}</Text>
                  <Text style={styles.rowMeta}>M: {Number(plan.monthlyUsd).toFixed(2)} · S: {Number(plan.semiannualUsd).toFixed(2)} · A: {Number(plan.annualUsd).toFixed(2)}</Text>
                </View>
                <Text style={[styles.badge, plan.isActive ? styles.badgeActive : styles.badgeInactive]}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            ))}

            {!plansQuery.isLoading && !plansQuery.data?.length ? (
              <Text style={styles.emptyText}>Sin planes registrados.</Text>
            ) : null}
          </View>
        </FadeInDown>

        <FadeInDown delay={160}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Licencias recientes</Text>
            {licensesQuery.isError ? <Text style={styles.errorText}>No se pudo cargar licencias recientes.</Text> : null}

            {(licensesQuery.data ?? []).slice(0, 15).map((license) => {
              const plan = planById.get(license.planId);
              return (
                <View key={license.id} style={styles.listRow} testID="services-license-row">
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle}>
                      {license.user?.name || `Usuario #${license.userId}`} · {plan?.name || `Plan #${license.planId}`}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {license.cycle} · vence {new Date(license.expiresAt).toLocaleDateString('es-CU')}
                    </Text>
                  </View>
                  <Text style={styles.badge}>{license.state}</Text>
                </View>
              );
            })}

            {!licensesQuery.isLoading && !licensesQuery.data?.length ? (
              <Text style={styles.emptyText}>Sin licencias registradas aún.</Text>
            ) : null}
          </View>
        </FadeInDown>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
    subtitle: { color: colors.text.secondary, marginTop: 4, marginBottom: spacing.md },
    partialWarning: {
      backgroundColor: `${colors.warning}1F`,
      borderWidth: 1,
      borderColor: `${colors.warning}66`,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    partialWarningTitle: {
      color: colors.warning,
      fontWeight: '700',
      marginBottom: 2,
    },
    partialWarningText: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    card: {
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
    blockSpacing: { marginTop: spacing.sm },
    pricingCard: {
      backgroundColor: `${colors.primary[500]}12`,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: `${colors.primary[500]}30`,
    },
    pricingTitle: {
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: 4,
    },
    pricingText: {
      color: colors.primary[600],
      fontWeight: '600',
    },
    pricingHint: {
      color: colors.text.secondary,
      marginTop: 4,
      fontSize: 12,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.sm,
    },
    rowMain: { flex: 1 },
    rowTitle: { color: colors.text.primary, fontWeight: '600' },
    rowMeta: { color: colors.text.secondary, fontSize: 12, marginTop: 2 },
    badge: {
      color: colors.primary[600],
      fontWeight: '700',
      fontSize: 12,
    },
    badgeActive: { color: colors.success },
    badgeInactive: { color: colors.text.secondary },
    emptyText: {
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    errorText: {
      color: colors.danger,
      marginBottom: spacing.sm,
    },
  });
