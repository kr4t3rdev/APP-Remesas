import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useColors, useShadows, useIsDark } from '../../store/themeStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FadeIn, FadeInDown, ScaleIn } from '../../components/animations';
import { BarChart, StatsCard } from '../../components/charts/Charts';
import type { ExchangeRate, RateHistory } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useCurrenciesQuery,
  useCurrentExchangeRatesQuery,
  useRateHistoryQuery,
  useUpdateExchangeRateMutation,
  usePairHistoryQuery,
  usePairStatsQuery,
} from '../../modules/exchange-rates/application/useExchangeRates';

type TabType = 'current' | 'history' | 'manual';

export const ExchangeRatesScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDark = useIsDark();
  
  const currenciesQuery = useCurrenciesQuery();
  const currentRatesQuery = useCurrentExchangeRatesQuery();
  const historyQuery = useRateHistoryQuery();
  const updateExchangeRateMutation = useUpdateExchangeRateMutation();

  const currencies = currenciesQuery.data ?? [];
  const rates = currentRatesQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const manualEntries = useMemo(
    () => history.filter((h) => h.source === 'MANUAL'),
    [history]
  );

  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyPair, setHistoryPair] = useState<{ fromId: number, toId: number } | null>(null);

  const pairHistoryQuery = usePairHistoryQuery(historyPair?.fromId ?? 0, historyPair?.toId ?? 0);
  const pairStatsQuery = usePairStatsQuery(historyPair?.fromId ?? 0, historyPair?.toId ?? 0);

  const selectedRateHistory = pairHistoryQuery.data ?? [];
  const pairStats = pairStatsQuery.data;

  const [formData, setFormData] = useState({
    currencyId: 0,
    referenceRate: '',
    buyMargin: '0.05',
    sellMargin: '0.05',
  });

  useEffect(() => {
    if (formData.currencyId !== 0) return;
    const filteredCurrencies = currencies.filter((c) => c.code !== 'CUP');
    const usd = filteredCurrencies.find((c) => c.code === 'USD');
    if (usd) {
      setFormData((prev) => ({ ...prev, currencyId: usd.id }));
    }
  }, [currencies, formData.currencyId]);

  const handleRefresh = async () => {
    await Promise.all([
      currenciesQuery.refetch(),
      currentRatesQuery.refetch(),
      historyQuery.refetch(),
    ]);
  };

  const handleSubmit = async () => {
    if (!formData.currencyId) {
      return;
    }
    if (!formData.referenceRate || parseFloat(formData.referenceRate) <= 0) {
      return;
    }

    try {
      await updateExchangeRateMutation.mutateAsync({
        currencyId: formData.currencyId,
        data: {
          referenceRate: parseFloat(formData.referenceRate),
          buyMargin: parseFloat(formData.buyMargin) || 0.05,
          sellMargin: parseFloat(formData.sellMargin) || 0.05,
        },
      });

      setModalVisible(false);
      setFormData(prev => ({
        ...prev,
        referenceRate: '',
        buyMargin: '0.05',
        sellMargin: '0.05',
      }));
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  };

  const openEditModal = (rate?: ExchangeRate) => {
    const filteredCurrencies = currencies.filter(c => c.code !== 'CUP');
    if (rate) {
      setSelectedCurrencyId(rate.currencyId);
      setFormData({
        currencyId: rate.currencyId,
        referenceRate: Number(rate.referenceRate).toString(),
        buyMargin: Number(rate.buyMargin).toString(),
        sellMargin: Number(rate.sellMargin).toString(),
      });
    } else {
      setSelectedCurrencyId(null);
      const usd = filteredCurrencies.find(c => c.code === 'USD');
      setFormData({
        currencyId: usd?.id || filteredCurrencies[0]?.id || 0,
        referenceRate: '',
        buyMargin: '0.05',
        sellMargin: '0.05',
      });
    }
    setModalVisible(true);
  };

  const viewCurrencyHistory = (currencyId: number) => {
    const cupCurrency = currencies.find(c => c.code === 'CUP');
    const cupId = cupCurrency?.id || 2;
    setHistoryPair({ fromId: currencyId, toId: cupId });
    setHistoryModalVisible(true);
  };

  const formatNumber = (value: number | string, decimals: number = 2) => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

  const formatPercent = (value: number | string) => {
    const num = Number(value) || 0;
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const getCurrencyColor = (code: string) => {
    const colorMap: Record<string, string> = {
      USD: themeColors.financial.venta,
      EUR: '#3B82F6',
      MLC: '#8B5CF6',
    };
    return colorMap[code] || themeColors.primary[500];
  };

  const renderCurrentRate = ({ item, index }: { item: ExchangeRate; index: number }) => {
    const currencyColor = getCurrencyColor(item.currency?.code || '');
    const buyRate = Number(item.referenceRate) * (1 - Number(item.buyMargin));
    const sellRate = Number(item.referenceRate) * (1 + Number(item.sellMargin));

    return (
      <FadeInDown delay={index * 50}>
        <TouchableOpacity
          style={[styles.rateCard, { backgroundColor: themeColors.card }, themeShadows.sm]}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.rateHeader}>
            <View style={[styles.currencyBadge, { backgroundColor: `${currencyColor}20` }]}>
              <Text style={[styles.currencySymbol, { color: currencyColor }]}>
                {item.currency?.symbol}
              </Text>
            </View>
            <View style={styles.rateInfo}>
              <Text style={[styles.currencyName, { color: themeColors.text.primary }]}>{item.currency?.name}</Text>
              <Text style={[styles.currencyCode, { color: themeColors.text.secondary }]}>{item.currency?.code}</Text>
            </View>
            <View style={styles.rateValues}>
              <View style={styles.rateValueRow}>
                <Text style={[styles.rateLabel, { color: themeColors.text.tertiary }]}>Compra</Text>
                <Text style={[styles.rateValue, { color: themeColors.financial.compra }]}>
                  {formatNumber(buyRate)}
                </Text>
              </View>
              <View style={styles.rateValueRow}>
                <Text style={[styles.rateLabel, { color: themeColors.text.tertiary }]}>Venta</Text>
                <Text style={[styles.rateValue, { color: themeColors.financial.venta }]}>
                  {formatNumber(sellRate)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.rateFooter, { borderTopColor: themeColors.border }]}>
            <View style={styles.rateDetail}>
              <Text style={[styles.rateDetailLabel, { color: themeColors.text.tertiary }]}>Referencia</Text>
              <Text style={[styles.rateDetailValue, { color: themeColors.text.primary }]}>{formatNumber(item.referenceRate)}</Text>
            </View>
            <View style={styles.rateDetail}>
              <Text style={[styles.rateDetailLabel, { color: themeColors.text.tertiary }]}>Margen Compra</Text>
              <Text style={[styles.rateDetailValue, { color: themeColors.text.primary }]}>{formatPercent(item.buyMargin)}</Text>
            </View>
            <View style={styles.rateDetail}>
              <Text style={[styles.rateDetailLabel, { color: themeColors.text.tertiary }]}>Margen Venta</Text>
              <Text style={[styles.rateDetailValue, { color: themeColors.text.primary }]}>{formatPercent(item.sellMargin)}</Text>
            </View>
          </View>

          {item.isNewRate && (
            <View style={styles.newBadge}>
              <Badge text="Nueva" variant="info" />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.historyButton, { borderTopColor: themeColors.border }]}
            onPress={() => viewCurrencyHistory(item.currencyId)}
          >
            <Ionicons name="time-outline" size={18} color={themeColors.primary[500]} />
            <Text style={[styles.historyButtonText, { color: themeColors.primary[500] }]}>Ver historial</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  const renderHistoryItem = ({ item, index }: { item: RateHistory; index: number }) => {
    const isManual = item.source === 'MANUAL';
    const fromCode = item.currencyFrom?.code || currencies.find(c => c.id === item.currencyFromId)?.code || '?';
    const toCode = item.currencyTo?.code || currencies.find(c => c.id === item.currencyToId)?.code || '?';

    return (
      <FadeInDown delay={index * 30}>
        <View style={[styles.historyCard, isManual && [styles.historyCardManual, { borderLeftColor: themeColors.warning }], { backgroundColor: themeColors.card }]}>
          {isManual && (
            <View style={[styles.manualBadge, { backgroundColor: `${themeColors.warning}20` }]}>
              <Ionicons name="hand-left" size={12} color={themeColors.warning} />
              <Text style={[styles.manualBadgeText, { color: themeColors.warning }]}>Manual</Text>
            </View>
          )}
          <View style={styles.historyRow}>
            <View style={styles.historyPair}>
              <Text style={[styles.historyCurrency, { color: themeColors.text.primary }]}>{fromCode}</Text>
              <Ionicons name="arrow-forward" size={16} color={themeColors.text.secondary} />
              <Text style={[styles.historyCurrency, { color: themeColors.text.primary }]}>{toCode}</Text>
            </View>
            <Text style={[styles.historyRate, { color: themeColors.primary[500] }]}>{formatNumber(item.rate)}</Text>
          </View>
          <Text style={[styles.historyDate, { color: themeColors.text.tertiary }]}>{formatDate(item.createdAt)}</Text>
        </View>
      </FadeInDown>
    );
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'current', label: 'Actuales', icon: 'trending-up' },
    { key: 'history', label: 'Historial', icon: 'time' },
    { key: 'manual', label: 'Manuales', icon: 'hand-left' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>Tasas de Cambio</Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>Gestiona las tasas de referencia</Text>
        </View>
      </FadeIn>

      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <ScaleIn key={tab.key} delay={index * 50}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === tab.key && { backgroundColor: themeColors.primary[500] }, !activeTab && { backgroundColor: themeColors.card }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#fff' : themeColors.text.secondary}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive, !activeTab && { color: themeColors.text.secondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          </ScaleIn>
        ))}
      </View>

      {activeTab === 'current' && (
        <FlatList
          data={rates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCurrentRate}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={currentRatesQuery.isRefetching || currenciesQuery.isRefetching || historyQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor={themeColors.primary[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="trending-up-outline" size={64} color={themeColors.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: themeColors.text.secondary }]}>No hay tasas configuradas</Text>
              <Text style={[styles.emptyStateSubtext, { color: themeColors.text.tertiary }]}>Toca + para agregar una nueva tasa</Text>
            </View>
          }
        />
      )}

      {activeTab === 'history' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={currentRatesQuery.isRefetching || currenciesQuery.isRefetching || historyQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor={themeColors.primary[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color={themeColors.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: themeColors.text.secondary }]}>No hay historial</Text>
            </View>
          }
        />
      )}

      {activeTab === 'manual' && (
        <FlatList
          data={manualEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={currentRatesQuery.isRefetching || currenciesQuery.isRefetching || historyQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor={themeColors.primary[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="hand-left-outline" size={64} color={themeColors.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: themeColors.text.secondary }]}>No hay entradas manuales</Text>
              <Text style={[styles.emptyStateSubtext, { color: themeColors.text.tertiary }]}>Las tasas que ingreses manualmente aparecerán aquí</Text>
            </View>
          }
        />
      )}

      {activeTab === 'current' && (
        <ScaleIn delay={200}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: themeColors.primary[500] }, themeShadows.lg]}
            onPress={() => openEditModal()}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </ScaleIn>
      )}

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
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                {selectedCurrencyId ? 'Editar Tasa' : 'Nueva Tasa'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Moneda</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                {currencies.filter(c => c.code !== 'CUP').map((currency) => (
                  <TouchableOpacity
                    key={currency.id}
                    style={[
                      styles.currencyButton,
                      formData.currencyId === currency.id && styles.currencyButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, currencyId: currency.id }))}
                  >
                    <Text style={[styles.currencyButtonText, formData.currencyId === currency.id && styles.currencyButtonTextActive]}>
                      {currency.symbol} {currency.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Input
                label="Tasa de Referencia"
                value={formData.referenceRate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, referenceRate: text }))}
                keyboardType="decimal-pad"
                placeholder="200.00"
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Input
                    label="Margen Compra (%)"
                    value={formData.buyMargin}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, buyMargin: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.05"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Input
                    label="Margen Venta (%)"
                    value={formData.sellMargin}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, sellMargin: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.05"
                  />
                </View>
              </View>

              {formData.referenceRate && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>Vista Previa</Text>
                  <View style={styles.previewRow}>
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Compra</Text>
                      <Text style={[styles.previewValue, { color: colors.financial.compra }]}>
                        {formatNumber(Number(formData.referenceRate) * (1 - Number(formData.buyMargin || 0)))}
                      </Text>
                    </View>
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Referencia</Text>
                      <Text style={styles.previewValue}>{formatNumber(formData.referenceRate)}</Text>
                    </View>
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Venta</Text>
                      <Text style={[styles.previewValue, { color: colors.financial.venta }]}>
                        {formatNumber(Number(formData.referenceRate) * (1 + Number(formData.sellMargin || 0)))}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <Button
                title={updateExchangeRateMutation.isPending ? 'Guardando...' : 'Guardar Tasa'}
                onPress={handleSubmit}
                loading={updateExchangeRateMutation.isPending}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setHistoryModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Historial de Tasas</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedRateHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.historyList}
              ListHeaderComponent={
                pairStats ? (
                  <View style={styles.historyHeaderContainer}>
                    <View style={styles.chartContainer}>
                      <BarChart 
                        data={selectedRateHistory.slice(0, 7).reverse().map(h => ({
                          label: format(new Date(h.createdAt), 'dd/MM'),
                          value: h.rate,
                          color: themeColors.primary[500]
                        }))}
                        height={180}
                        showValues={false}
                      />
                    </View>
                    <View style={styles.statsRow}>
                      <StatsCard 
                        title="Mínimo" 
                        value={formatNumber(pairStats.min)} 
                        trend="neutral"
                        style={{ flex: 1, marginRight: 8 }}
                      />
                      <StatsCard 
                        title="Promedio" 
                        value={formatNumber(pairStats.average)} 
                        trend={pairStats.trend}
                        trendValue={pairStats.changePercentage ? `${pairStats.changePercentage.toFixed(1)}%` : undefined}
                        style={{ flex: 1, marginRight: 8 }}
                      />
                      <StatsCard 
                        title="Máximo" 
                        value={formatNumber(pairStats.max)} 
                        trend="neutral"
                        style={{ flex: 1 }}
                      />
                    </View>
                    <Text style={[styles.historyListTitle, { color: themeColors.text.primary }]}>Últimos Movimientos</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: themeColors.text.secondary }]}>No hay historial para esta moneda</Text>
                </View>
              }
            />
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  rateCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
  },
  rateInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyCode: {
    fontSize: 12,
  },
  rateValues: {
    alignItems: 'flex-end',
  },
  rateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateLabel: {
    fontSize: 11,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  rateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  rateDetail: {
    alignItems: 'center',
  },
  rateDetailLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  rateDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  historyCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyCardManual: {
    borderLeftWidth: 3,
  },
  manualBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyCurrency: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyRate: {
    fontSize: 18,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 11,
    marginTop: 4,
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
    textAlign: 'center',
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
  currencyScroll: {
    marginBottom: spacing.md,
  },
  currencyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
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
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewItem: {
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  historyList: {
    paddingBottom: spacing.xl,
  },
  historyHeaderContainer: {
    padding: spacing.md,
  },
  chartContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  historyListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  currencyButtonActive: {
    backgroundColor: colors.primary[500],
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyButtonTextActive: {
    color: '#fff',
  },
});
