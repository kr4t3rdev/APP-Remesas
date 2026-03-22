import React, { useState } from 'react';
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
import type { Currency } from '../../types';
import {
  useCurrenciesWithPrimaryQuery,
  useCreateCurrencyMutation,
  useSetPrimaryCurrencyMutation,
} from '../../modules/currencies/application/useCurrencies';

export const CurrenciesScreen: React.FC = () => {
  const currenciesQuery = useCurrenciesWithPrimaryQuery();
  const createCurrencyMutation = useCreateCurrencyMutation();
  const setPrimaryCurrencyMutation = useSetPrimaryCurrencyMutation();

  const currencies = currenciesQuery.data?.currencies ?? [];
  const primaryCurrencyId = currenciesQuery.data?.primaryCurrencyId ?? null;

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
  });

  const handleRefresh = async () => {
    await currenciesQuery.refetch();
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.symbol) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    try {
      await createCurrencyMutation.mutateAsync({
        code: formData.code.toUpperCase(),
        name: formData.name,
        symbol: formData.symbol,
      });
      Alert.alert('Éxito', 'Moneda creada correctamente');
      setModalVisible(false);
      setFormData({ code: '', name: '', symbol: '' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la moneda');
    }
  };

  const handleSetPrimary = async (currencyId: number) => {
    try {
      await setPrimaryCurrencyMutation.mutateAsync(currencyId);
      Alert.alert('Éxito', 'Moneda principal actualizada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo establecer la moneda principal');
    }
  };

  const renderCurrency = ({ item, index }: { item: Currency; index: number }) => {
    const isPrimary = item.id === primaryCurrencyId;

    return (
      <FadeInDown delay={index * 50}>
        <TouchableOpacity
          style={[styles.currencyCard, isPrimary && styles.currencyCardPrimary]}
          onPress={() => !isPrimary && handleSetPrimary(item.id)}
          activeOpacity={isPrimary ? 1 : 0.7}
          disabled={isPrimary}
        >
          <View style={styles.currencyInfo}>
            <View style={[styles.currencyIcon, { backgroundColor: isPrimary ? colors.primary[500] + '20' : colors.surface }]}>
              <Text style={[styles.currencySymbol, { color: isPrimary ? colors.primary[500] : colors.text.primary }]}>
                {item.symbol}
              </Text>
            </View>
            <View>
              <Text style={styles.currencyName}>{item.name}</Text>
              <Text style={styles.currencyCode}>{item.code}</Text>
            </View>
          </View>
          {isPrimary && (
            <View style={styles.primaryBadge}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.primaryBadgeText}>Principal</Text>
            </View>
          )}
          {!isPrimary && (
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          )}
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.title}>Monedas</Text>
          <Text style={styles.subtitle}>Configura tus monedas y selecciona la principal</Text>
        </View>
      </FadeIn>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
        <Text style={styles.infoText}>
          Toca una moneda para establecerla como principal. La moneda principal se usará como referencia predeterminada.
        </Text>
      </View>

      <FlatList
        data={currencies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCurrency}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={currenciesQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyStateText}>No hay monedas configuradas</Text>
            <Text style={styles.emptyStateSubtext}>Toca + para agregar una nueva moneda</Text>
          </View>
        }
      />

      <ScaleIn delay={200}>
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </ScaleIn>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Moneda</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Código (ISO 4217)"
                value={formData.code}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, code: text }))}
                placeholder="ej. USD"
                autoCapitalize="characters"
                maxLength={3}
              />

              <Input
                label="Nombre"
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="ej. Dólar Estadounidense"
              />

              <Input
                label="Símbolo"
                value={formData.symbol}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, symbol: text }))}
                placeholder="ej. $"
              />

              <Button
                title={createCurrencyMutation.isPending ? 'Guardando...' : 'Guardar Moneda'}
                onPress={handleSubmit}
                loading={createCurrencyMutation.isPending}
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500] + '10',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.text.secondary },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  currencyCardPrimary: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  currencyInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  currencyIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  currencySymbol: { fontSize: 18, fontWeight: '700' },
  currencyName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  currencyCode: { fontSize: 12, color: colors.text.secondary },
  primaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warning + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.full },
  primaryBadgeText: { fontSize: 11, fontWeight: '600', color: colors.warning },
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
  modalBackdrop: { flex: 1, backgroundColor: 'transparent' },
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
  submitButton: { marginTop: spacing.md },
});
