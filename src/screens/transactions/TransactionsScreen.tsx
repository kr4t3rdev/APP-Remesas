import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown, ScaleIn, PressableScale } from '../../components/animations';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useColors, useShadows, useIsDark, useGradients } from '../../store/themeStore';
import type { Transaction } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useCreateTransactionMutation,
  useCurrenciesQuery,
  useExchangeRatesQuery,
  useTransactionsQuery,
} from '../../modules/transactions/application/useTransactions';

type FilterType = 'all' | 'COMPRA' | 'VENTA';

export const TransactionsScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDark = useIsDark();
  const gradients = useGradients();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const createTransactionMutation = useCreateTransactionMutation();

  const [formData, setFormData] = useState({
    type: 'COMPRA' as 'COMPRA' | 'VENTA',
    currencyId: 0,
    amount: '',
    rate: '',
    notes: '',
  });

  const selectedType = filter === 'all' ? undefined : filter;
  const transactionsQuery = useTransactionsQuery(selectedType ? { type: selectedType } : undefined);
  const currenciesQuery = useCurrenciesQuery();
  const exchangeRatesQuery = useExchangeRatesQuery();

  const transactions = transactionsQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
  const exchangeRates = exchangeRatesQuery.data ?? [];
  const selectableCurrencies = useMemo(
    () => currencies.filter((c) => c.code !== 'CUP' && c.isActive),
    [currencies]
  );

  useEffect(() => {
    if (formData.currencyId !== 0 || selectableCurrencies.length === 0) return;

    const usd = selectableCurrencies.find((c) => c.code === 'USD') ?? selectableCurrencies[0];
    const rate = exchangeRates.find((r) => r.currencyId === usd.id);
    setFormData((prev) => ({
      ...prev,
      currencyId: usd.id,
      rate: rate ? rate.sellRate.toString() : '',
    }));
  }, [exchangeRates, formData.currencyId, selectableCurrencies]);

  const handleRefresh = async () => {
    try {
      await transactionsQuery.refetch();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    }
  };

  const handleCurrencyChange = (currencyId: number) => {
    const rate = exchangeRates.find(r => r.currencyId === currencyId);
    setFormData(prev => ({
      ...prev,
      currencyId,
      rate: rate ? (prev.type === 'COMPRA' ? rate.buyRate : rate.sellRate).toString() : '',
    }));
  };

  const handleTypeChange = (type: 'COMPRA' | 'VENTA') => {
    const rate = exchangeRates.find(r => r.currencyId === formData.currencyId);
    setFormData(prev => ({
      ...prev,
      type,
      rate: rate ? (type === 'COMPRA' ? rate.buyRate : rate.sellRate).toString() : prev.rate,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.currencyId) {
      Alert.alert('Error', 'Selecciona una moneda');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      Alert.alert('Error', 'Ingresa una tasa válida');
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        type: formData.type,
        currencyId: formData.currencyId,
        amount: parseFloat(formData.amount),
        rate: parseFloat(formData.rate),
        notes: formData.notes || undefined,
      });

      setModalVisible(false);
      const usd = selectableCurrencies.find((c) => c.code === 'USD') ?? selectableCurrencies[0];
      setFormData({
        type: 'COMPRA',
        currencyId: usd?.id || 0,
        amount: '',
        rate: '',
        notes: '',
      });
      Alert.alert('Éxito', 'Transacción registrada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la transacción');
    }
  };

  const formatCurrency = (amount: number | string, symbol: string) => {
    const numAmount = Number(amount) || 0;
    return `${symbol} ${numAmount.toLocaleString('es-CU', { minimumFractionDigits: 2 })}`;
  };

  const formatRate = (rate: number | string) => {
    const numRate = Number(rate) || 0;
    return numRate.toFixed(2);
  };

  const formatTotalCup = (total: number | string) => {
    const numTotal = Number(total) || 0;
    return numTotal.toLocaleString('es-CU', { minimumFractionDigits: 2 });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: es });
    }
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isCompra = item.type === 'COMPRA';
    const isPending = item.status === 'PENDIENTE';
    
    return (
      <FadeInDown delay={index * 30}>
        <TouchableOpacity
          style={[styles.transactionCard, { backgroundColor: themeColors.card }, themeShadows.sm]}
          activeOpacity={0.8}
        >
          <View style={styles.transactionHeader}>
            <View style={[
              styles.transactionIcon,
              { backgroundColor: isCompra ? themeColors.financial.compraLight : themeColors.financial.ventaLight }
            ]}>
              <Ionicons 
                name={isCompra ? 'arrow-down' : 'arrow-up'} 
                size={20} 
                color={isCompra ? themeColors.financial.compra : themeColors.financial.venta} 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionTitle, { color: themeColors.text.primary }]}>
                {isCompra ? 'Compra' : 'Venta'} de {item.currency?.code}
              </Text>
              <Text style={[styles.transactionDate, { color: themeColors.text.secondary }]}>{formatTime(item.createdAt)}</Text>
            </View>
            <View style={styles.transactionAmounts}>
              <Text style={[styles.transactionAmount, { color: themeColors.text.primary }]}>
                {formatCurrency(item.amount, item.currency?.symbol || '$')}
              </Text>
              <Text style={[styles.transactionRate, { color: themeColors.text.secondary }]}>@ {formatRate(item.rate)}</Text>
            </View>
          </View>
          
          <View style={[styles.transactionFooter, { borderTopColor: themeColors.border }]}>
            <View style={styles.transactionTotal}>
              <Text style={[styles.transactionTotalLabel, { color: themeColors.text.tertiary }]}>Total</Text>
              <Text style={[
                styles.transactionTotalValue,
                { color: isCompra ? themeColors.financial.compra : themeColors.financial.venta }
              ]}>
                {isCompra ? '-' : '+'}$ {formatTotalCup(item.totalCup)} CUP
              </Text>
            </View>
            <Badge
              text={isPending ? 'Pendiente' : 'Reconciliado'}
              variant={isPending ? 'warning' : 'success'}
            />
          </View>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'COMPRA', label: 'Compras' },
    { key: 'VENTA', label: 'Ventas' },
  ];

  const selectedCurrency = currencies.find(c => c.id === formData.currencyId);
  const previewTotal = formData.amount && formData.rate 
    ? (parseFloat(formData.amount) * parseFloat(formData.rate)).toLocaleString('es-CU', { minimumFractionDigits: 2 })
    : '0.00';

  const getCurrencyColor = (code: string) => {
    const colorMap: Record<string, string> = {
      USD: themeColors.currencies.usd.primary,
      EUR: themeColors.currencies.eur.primary,
      MLC: themeColors.currencies.mlc.primary,
    };
    return colorMap[code] || themeColors.primary[500];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>Transacciones</Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>Historial de compras y ventas</Text>
        </View>
      </FadeIn>

      <FadeInDown delay={50}>
        <View style={styles.actionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {filters.map((f, index) => (
              <ScaleIn key={f.key} delay={index * 50}>
                <TouchableOpacity
                  onPress={() => setFilter(f.key)}
                  style={[
                    styles.filterButton,
                    filter === f.key ? { backgroundColor: themeColors.primary[500] } : { backgroundColor: themeColors.card }
                  ]}
                >
                  <Text style={[
                    styles.filterText,
                    filter === f.key ? { color: '#fff' } : { color: themeColors.text.secondary }
                  ]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              </ScaleIn>
            ))}
            <ScaleIn delay={150}>
              <TouchableOpacity
                onPress={() => navigation.navigate('BulkReconciliation' as never)}
                style={[styles.filterButton, { backgroundColor: themeColors.card, borderColor: themeColors.primary[500], borderWidth: 1 }]}
              >
                <Text style={[styles.filterText, { color: themeColors.primary[500] }]}>Reconciliar</Text>
              </TouchableOpacity>
            </ScaleIn>
            <ScaleIn delay={200}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ReconciliationsHistory' as never)}
                style={[styles.filterButton, { backgroundColor: themeColors.card }]}
              >
                <Text style={[styles.filterText, { color: themeColors.text.secondary }]}>Historial</Text>
              </TouchableOpacity>
            </ScaleIn>
          </ScrollView>
        </View>
      </FadeInDown>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={transactionsQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="swap-horizontal-outline" size={64} color={themeColors.text.tertiary} />
            <Text style={[styles.emptyStateText, { color: themeColors.text.secondary }]}>No hay transacciones</Text>
            <Text style={[styles.emptyStateSubtitle, { color: themeColors.text.tertiary }]}>
              Toca el botón + para registrar una nueva
            </Text>
          </View>
        }
      />

      <ScaleIn delay={200}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: themeColors.primary[500] }, themeShadows.lg]}
          onPress={() => setModalVisible(true)}
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>Nueva Transacción</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionLabel, { color: themeColors.text.primary }]}>Tipo de operación</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === 'COMPRA' && { backgroundColor: themeColors.financial.compra }
                  ]}
                  onPress={() => handleTypeChange('COMPRA')}
                >
                  <Ionicons 
                    name="arrow-down-circle" 
                    size={24} 
                    color={formData.type === 'COMPRA' ? '#fff' : themeColors.financial.compra} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === 'COMPRA' && styles.typeButtonTextActive
                  ]}>
                    Compra
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === 'VENTA' && { backgroundColor: themeColors.financial.venta }
                  ]}
                  onPress={() => handleTypeChange('VENTA')}
                >
                  <Ionicons 
                    name="arrow-up-circle" 
                    size={24} 
                    color={formData.type === 'VENTA' ? '#fff' : themeColors.financial.venta} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === 'VENTA' && styles.typeButtonTextActive
                  ]}>
                    Venta
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionLabel, { color: themeColors.text.primary }]}>Moneda</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.currencyScroll}
              >
                {selectableCurrencies.map((currency) => {
                  const currencyColor = getCurrencyColor(currency.code);
                  const isSelected = formData.currencyId === currency.id;
                  return (
                    <TouchableOpacity
                      key={currency.id}
                      style={[
                        styles.currencyButton,
                        isSelected && { backgroundColor: currencyColor, borderColor: currencyColor }
                      ]}
                      onPress={() => handleCurrencyChange(currency.id)}
                    >
                      <Text style={[
                        styles.currencySymbol,
                        isSelected && styles.currencySymbolActive
                      ]}>
                        {currency.symbol}
                      </Text>
              <Text style={[
                styles.currencyCode,
                isSelected ? { color: 'rgba(255,255,255,0.8)' } : { color: themeColors.text.secondary }
              ]}>
                        {currency.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Input
                    label="Monto"
                    value={formData.amount}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Input
                    label="Tasa de cambio"
                    value={formData.rate}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, rate: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
              </View>

              <View style={[styles.previewCard, { backgroundColor: themeColors.surface }]}>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: themeColors.text.secondary }]}>
                    {formData.amount || '0'} {selectedCurrency?.code || 'USD'}
                  </Text>
                  <Text style={[styles.previewOperator, { color: themeColors.text.tertiary }]}>×</Text>
                  <Text style={[styles.previewLabel, { color: themeColors.text.secondary }]}>{formData.rate || '0'}</Text>
                  <Text style={[styles.previewOperator, { color: themeColors.text.tertiary }]}>=</Text>
                  <Text style={[styles.previewValue, { color: themeColors.primary[500] }]}>$ {previewTotal} CUP</Text>
                </View>
              </View>

              <Input
                label="Notas (opcional)"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Descripción o comentario..."
                multiline
                numberOfLines={2}
              />

              <Button
                title={createTransactionMutation.isPending ? 'Registrando...' : 'Registrar Transacción'}
                onPress={handleSubmit}
                loading={createTransactionMutation.isPending}
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionsContainer: {
    marginBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  transactionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmounts: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionRate: {
    fontSize: 12,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  transactionTotal: {
    flex: 1,
  },
  transactionTotalLabel: {
    fontSize: 11,
  },
  transactionTotalValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  emptyStateSubtitle: {
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F1F5F9',
    gap: spacing.sm,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  currencyScroll: {
    marginBottom: spacing.lg,
  },
  currencyButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F1F5F9',
    marginRight: spacing.sm,
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  currencySymbolActive: {
    color: '#fff',
  },
  currencyCode: {
    fontSize: 12,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  previewCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  previewLabel: {
    fontSize: 14,
  },
  previewOperator: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
