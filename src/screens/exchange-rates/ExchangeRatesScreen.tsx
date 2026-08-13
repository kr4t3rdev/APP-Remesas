import React, { useEffect, useMemo, useState } from "react";
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
  useWindowDimensions,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { colors, spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import { BarChart, StatsCard } from "../../components/charts/Charts";
import type { ExchangeRate, RateHistory } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useCurrentExchangeRatesQuery,
  useRateHistoryQuery,
  useUpdateExchangeRateMutation,
  usePairHistoryQuery,
  usePairStatsQuery,
  useResetRateHistoryMutation,
  useDeleteExchangeRateMutation,
} from "../../modules/exchange-rates/application/useExchangeRates";
import { useCurrenciesWithPrimaryQuery } from "../../modules/currencies/application/useCurrencies";

import CountryFlag from "react-native-country-flag";
import { getCountryCode } from "../../utils/currencyUtils";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { ProfileFeatureBackButton } from "../profile/ProfileFeatureBackButton";
import { BREAKPOINTS } from "../../hooks/useResponsive";

type TabType = "current" | "history" | "manual";

export const ExchangeRatesScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

  const currenciesQuery = useCurrenciesWithPrimaryQuery();
  const currentRatesQuery = useCurrentExchangeRatesQuery();
  const historyQuery = useRateHistoryQuery();
  const updateExchangeRateMutation = useUpdateExchangeRateMutation();
  const deleteExchangeRateMutation = useDeleteExchangeRateMutation();
  const resetRateHistoryMutation = useResetRateHistoryMutation();

  const currencies = currenciesQuery.data?.currencies ?? [];
  const rates = currentRatesQuery.data ?? [];

  const primaryCurrencyId = currenciesQuery.data?.primaryCurrencyId ?? null;
  const secondaryCurrencies = currencies.filter(
    (c) => c.id !== primaryCurrencyId && c.code !== "CUP"
  );
  const canCreateRate = primaryCurrencyId !== null && secondaryCurrencies.length >= 1;

  const history = historyQuery.data ?? [];
  const manualEntries = history.filter((item) => item.source === "MANUAL");

  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(
    null,
  );
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyPair, setHistoryPair] = useState<{
    fromId: number;
    toId: number;
  } | null>(null);

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

  const pairHistoryQuery = usePairHistoryQuery(
    historyPair?.fromId ?? 0,
    historyPair?.toId ?? 0,
  );
  const pairStatsQuery = usePairStatsQuery(
    historyPair?.fromId ?? 0,
    historyPair?.toId ?? 0,
  );

  const selectedRateHistory = pairHistoryQuery.data ?? [];
  const pairStats = pairStatsQuery.data;

  const [formData, setFormData] = useState({
    currencyId: 0,
    referenceRate: "",
    exactBuy: "",
    exactSell: "",
  });

  useEffect(() => {
    if (formData.currencyId !== 0) return;
    const filteredCurrencies = currencies.filter((c) => c.code !== "CUP");
    const usd = filteredCurrencies.find((c) => c.code === "USD");
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
    const referenceRate = parseFloat(formData.referenceRate);
    if (!referenceRate || referenceRate <= 0) {
      return;
    }

    const exactBuy = parseFloat(formData.exactBuy) || referenceRate;
    const exactSell = parseFloat(formData.exactSell) || referenceRate;

    if (exactBuy > referenceRate) {
      Alert.alert(
        "Error de validación",
        "La tasa de compra no puede ser mayor que la tasa de referencia.",
      );
      return;
    }

    if (exactSell < referenceRate) {
      Alert.alert(
        "Error de validación",
        "La tasa de venta no puede ser menor que la tasa de referencia.",
      );
      return;
    }

    const buyMargin = 1 - exactBuy / referenceRate;
    const sellMargin = exactSell / referenceRate - 1;

    try {
      await updateExchangeRateMutation.mutateAsync({
        currencyId: formData.currencyId,
        data: {
          referenceRate,
          buyMargin: isNaN(buyMargin) ? 0 : buyMargin,
          sellMargin: isNaN(sellMargin) ? 0 : sellMargin,
        },
      });

      setModalVisible(false);
      setFormData((prev) => ({
        ...prev,
        referenceRate: "",
        exactBuy: "",
        exactSell: "",
      }));
    } catch (error) {
      console.error("Error updating rate:", error);
    }
  };

  const openEditModal = (rate?: ExchangeRate) => {
    if (!rate && !canCreateRate) {
      Alert.alert(
        "Error",
        "Para crear una tasa de cambio debe tener una moneda principal configurada y al menos una moneda secundaria.",
      );
      return;
    }

    const filteredCurrencies = currencies.filter((c) => c.code !== "CUP");
    if (rate) {
      setSelectedCurrencyId(rate.currencyId);
      const refRate = Number(rate.referenceRate) || 0;
      const buyM = Number(rate.buyMargin) || 0;
      const sellM = Number(rate.sellMargin) || 0;
      setFormData({
        currencyId: rate.currencyId,
        referenceRate: refRate.toString(),
        exactBuy: formatNumber(refRate * (1 - buyM)),
        exactSell: formatNumber(refRate * (1 + sellM)),
      });
    } else {
      setSelectedCurrencyId(null);
      const usd = filteredCurrencies.find((c) => c.code === "USD");
      setFormData({
        currencyId: usd?.id || filteredCurrencies[0]?.id || 0,
        referenceRate: "",
        exactBuy: "",
        exactSell: "",
      });
    }
    setModalVisible(true);
  };

  const handleDeleteRate = (currencyId: number) => {
    setConfirmModal({
      visible: true,
      title: "Eliminar Tasa",
      message:
        "¿Estás seguro de que deseas eliminar esta tasa de cambio? Esta acción no se puede deshacer.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteExchangeRateMutation.mutateAsync(currencyId);
          setModalVisible(false);
          setConfirmModal((prev) => ({ ...prev, visible: false }));
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            "No se puede eliminar la tasa de cambio porque tiene transacciones o movimientos asociados.";
          Alert.alert("Error", errorMessage);
          setConfirmModal((prev) => ({ ...prev, visible: false }));
        }
      },
    });
  };

  const viewCurrencyHistory = (currencyId: number) => {
    const cupCurrency = currencies.find((c) => c.code === "CUP");
    const cupId = cupCurrency?.id || 2;
    setHistoryPair({ fromId: currencyId, toId: cupId });
    setHistoryModalVisible(true);
  };

  const handleResetHistory = () => {
    setConfirmModal({
      visible: true,
      title: "Resetear Historial",
      message:
        "¿Estás seguro de que deseas eliminar todo el historial de tasas para esta moneda?",
      variant: "danger",
      onConfirm: async () => {
        if (historyPair?.fromId) {
          try {
            await resetRateHistoryMutation.mutateAsync(historyPair.fromId);
            Alert.alert("Éxito", "Historial reseteado correctamente");
            setHistoryModalVisible(false);
            setConfirmModal((prev) => ({ ...prev, visible: false }));
          } catch (error) {
            Alert.alert("Error", "No se pudo resetear el historial");
            setConfirmModal((prev) => ({ ...prev, visible: false }));
          }
        }
      },
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const fromCurrency = currencies.find((c) => c.id === historyPair?.fromId);
      const toCurrency = currencies.find((c) => c.id === historyPair?.toId);

      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              h1 { color: #1a1a1a; text-align: center; }
              p { text-align: center; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .source-manual { color: #d97706; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Historial de Tasas de Cambio</h1>
            <p>Par: ${fromCurrency?.code || "?"} -> ${toCurrency?.code || "?"}</p>
            <p>Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}</p>
            <table>
              <tr>
                <th>Fecha</th>
                <th>Tasa</th>
                <th>Origen</th>
              </tr>
              ${selectedRateHistory
                .map(
                  (item) => `
                <tr>
                  <td>${formatDate(item.createdAt)}</td>
                  <td>${formatNumber(item.rate)}</td>
                  <td class="${item.source === "MANUAL" ? "source-manual" : ""}">${item.source === "MANUAL" ? "Manual" : "Sistema"}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al generar el PDF");
      console.error(error);
    }
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
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: es });
  };

  const getCurrencyColor = (code: string) => {
    const colorMap: Record<string, string> = {
      USD: themeColors.financial.venta,
      EUR: "#3B82F6",
      MLC: "#8B5CF6",
    };
    return colorMap[code] || themeColors.primary[500];
  };

  const renderCurrentRate = ({
    item,
    index,
  }: {
    item: ExchangeRate;
    index: number;
  }) => {
    const currencyColor = getCurrencyColor(item.currency?.code || "");
    const buyRate = Number(item.referenceRate) * (1 - Number(item.buyMargin));
    const sellRate = Number(item.referenceRate) * (1 + Number(item.sellMargin));

    return (
      <FadeInDown delay={index * 50}>
        <TouchableOpacity
          style={[
            styles.rateCard,
            { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 },
          ]}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.rateHeader}>
            <View style={styles.currencySymbolContainer}>
              {item.currency?.code && getCountryCode(item.currency.code) ? (
                <CountryFlag
                  isoCode={getCountryCode(item.currency.code)!}
                  size={32}
                  style={{ borderRadius: 4 }}
                />
              ) : (
                <Text style={[styles.currencySymbol, { color: currencyColor }]}>
                  {item.currency?.symbol || "$"}
                </Text>
              )}
            </View>
            <View style={styles.rateInfo}>
              <Text
                style={[
                  styles.currencyName,
                  { color: themeColors.text.primary },
                ]}
              >
                {item.currency?.name}
              </Text>
              <Text
                style={[
                  styles.currencyCode,
                  { color: themeColors.text.secondary },
                ]}
              >
                {item.currency?.code}
              </Text>
            </View>
            <View style={styles.rateValues}>
              <View style={styles.rateValueRow}>
                <Text
                  style={[
                    styles.rateLabel,
                    { color: themeColors.text.tertiary },
                  ]}
                >
                  Compra
                </Text>
                <Text
                  style={[
                    styles.rateValue,
                    { color: themeColors.financial.compra },
                  ]}
                >
                  {formatNumber(buyRate)}
                </Text>
              </View>
              <View style={styles.rateValueRow}>
                <Text
                  style={[
                    styles.rateLabel,
                    { color: themeColors.text.tertiary },
                  ]}
                >
                  Venta
                </Text>
                <Text
                  style={[
                    styles.rateValue,
                    { color: themeColors.financial.venta },
                  ]}
                >
                  {formatNumber(sellRate)}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[styles.rateFooter, { borderTopColor: themeColors.border }]}
          >
            <View style={styles.rateDetail}>
              <Text
                style={[
                  styles.rateDetailLabel,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Referencia
              </Text>
              <Text
                style={[
                  styles.rateDetailValue,
                  { color: themeColors.text.primary },
                ]}
              >
                {formatNumber(item.referenceRate)}
              </Text>
            </View>
            <View style={styles.rateDetail}>
              <Text
                style={[
                  styles.rateDetailLabel,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Margen Compra
              </Text>
              <Text
                style={[
                  styles.rateDetailValue,
                  { color: themeColors.text.primary },
                ]}
              >
                {formatPercent(item.buyMargin)}
              </Text>
            </View>
            <View style={styles.rateDetail}>
              <Text
                style={[
                  styles.rateDetailLabel,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Margen Venta
              </Text>
              <Text
                style={[
                  styles.rateDetailValue,
                  { color: themeColors.text.primary },
                ]}
              >
                {formatPercent(item.sellMargin)}
              </Text>
            </View>
          </View>

          {item.isNewRate && (
            <View style={styles.newBadge}>
              <Badge text="Nueva" variant="info" />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.historyButton,
              { borderTopColor: themeColors.border },
            ]}
            onPress={() => viewCurrencyHistory(item.currencyId)}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={themeColors.primary[500]}
            />
            <Text
              style={[
                styles.historyButtonText,
                { color: themeColors.primary[500] },
              ]}
            >
              Ver historial
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: RateHistory;
    index: number;
  }) => {
    const isManual = item.source === "MANUAL";
    const fromCurrency =
      item.currencyFrom || currencies.find((c) => c.id === item.currencyFromId);
    const toCurrency =
      item.currencyTo || currencies.find((c) => c.id === item.currencyToId);
    const fromCode = fromCurrency?.code || "?";
    const toCode = toCurrency?.code || "?";
    const currencyColor = getCurrencyColor(fromCode);

    return (
      <FadeInDown delay={index * 30}>
        <View
          style={[
            styles.historyCard,
            isManual && [
              styles.historyCardManual,
              { borderLeftColor: themeColors.warning },
            ],
            { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 },
          ]}
        >
          <View style={styles.historyRow}>
            <View style={styles.historyLeftContent}>
              <View style={styles.historyCurrencySymbolContainer}>
                {fromCurrency?.code && getCountryCode(fromCurrency.code) ? (
                  <CountryFlag
                    isoCode={getCountryCode(fromCurrency.code)!}
                    size={24}
                    style={{ borderRadius: 4 }}
                  />
                ) : (
                  <Text
                    style={[
                      styles.historyCurrencySymbol,
                      { color: currencyColor },
                    ]}
                  >
                    {fromCurrency?.symbol || "$"}
                  </Text>
                )}
              </View>
              <View style={styles.historyPairContainer}>
                <View style={styles.historyPair}>
                  <Text
                    style={[
                      styles.historyCurrency,
                      { color: themeColors.text.primary },
                    ]}
                  >
                    {fromCode}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={themeColors.text.tertiary}
                    style={{ marginHorizontal: 4 }}
                  />
                  <Text
                    style={[
                      styles.historyCurrency,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    {toCode}
                  </Text>
                </View>
                <View style={styles.historyDateRow}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={themeColors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.historyDate,
                      { color: themeColors.text.tertiary },
                    ]}
                  >
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.historyRightContent}>
              {isManual && (
                <View
                  style={[
                    styles.inlineManualBadge,
                    { backgroundColor: `${themeColors.warning}15` },
                  ]}
                >
                  <Ionicons
                    name="hand-left"
                    size={10}
                    color={themeColors.warning}
                  />
                  <Text
                    style={[
                      styles.inlineManualBadgeText,
                      { color: themeColors.warning },
                    ]}
                  >
                    Manual
                  </Text>
                </View>
              )}
              <Text
                style={[
                  styles.historyRate,
                  { color: themeColors.primary[500] },
                ]}
              >
                {formatNumber(item.rate)}
              </Text>
            </View>
          </View>
        </View>
      </FadeInDown>
    );
  };

  const tabs: {
    key: TabType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "current", label: "Actuales", icon: "trending-up" },
    { key: "history", label: "Historial", icon: "time" },
    { key: "manual", label: "Manuales", icon: "hand-left" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {isWebDesktop ? (
        <View style={styles.webTopBar}>
          <ProfileFeatureBackButton />
          {activeTab === "current" ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Nueva tasa"
              onPress={() =>
                canCreateRate
                  ? openEditModal()
                  : Alert.alert(
                      "Error",
                      "Para crear una tasa de cambio debe tener una moneda principal configurada y al menos una moneda secundaria.",
                    )
              }
              disabled={!canCreateRate}
              style={[
                styles.headerAction,
                { backgroundColor: themeColors.primary[500] },
                !canCreateRate && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.headerActionText}>Nueva tasa</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <ProfileFeatureBackButton />
      )}
      <FadeIn>
        <View style={styles.header}>
          {/* <Text style={[styles.title, { color: themeColors.text.primary }]}>Tasas de Cambio</Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>Gestiona las tasas de referencia</Text> */}
        </View>
      </FadeIn>

      {/* <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <ScaleIn key={tab.key} delay={index * 50}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === tab.key
                  ? { backgroundColor: themeColors.primary[500] }
                  : { backgroundColor: themeColors.card },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={
                  activeTab === tab.key ? "#fff" : themeColors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key
                    ? { color: "#fff" }
                    : { color: themeColors.text.secondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          </ScaleIn>
        ))}
      </View> */}

      {activeTab === "current" && (
        <FlatList
          data={rates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCurrentRate}
          contentContainerStyle={[
            styles.listContent,
            isWebDesktop && styles.webListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={
                currentRatesQuery.isRefetching ||
                currenciesQuery.isRefetching ||
                historyQuery.isRefetching
              }
              onRefresh={handleRefresh}
              tintColor={themeColors.primary[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="trending-up-outline"
                size={64}
                color={themeColors.text.tertiary}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: themeColors.text.secondary },
                ]}
              >
                No hay tasas configuradas
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Toca + para agregar una nueva tasa
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: themeColors.text.tertiary },
                ]}
              >
                <Ionicons name="hand-left" size={10} color={themeColors.warning} />
                Recuerda agregar al menos una moneda secundaria para crear una tasa de cambio.
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "history" && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={[
            styles.listContent,
            isWebDesktop && styles.webListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={
                currentRatesQuery.isRefetching ||
                currenciesQuery.isRefetching ||
                historyQuery.isRefetching
              }
              onRefresh={handleRefresh}
              tintColor={themeColors.primary[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="time-outline"
                size={64}
                color={themeColors.text.tertiary}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: themeColors.text.secondary },
                ]}
              >
                No hay historial
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "manual" && (
        <FlatList
          data={manualEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={[
            styles.listContent,
            isWebDesktop && styles.webListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={
                currentRatesQuery.isRefetching ||
                currenciesQuery.isRefetching ||
                historyQuery.isRefetching
              }
              onRefresh={handleRefresh}
              tintColor={themeColors.primary[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="hand-left-outline"
                size={64}
                color={themeColors.text.tertiary}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: themeColors.text.secondary },
                ]}
              >
                No hay entradas manuales
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Las tasas que ingreses manualmente aparecerán aquí
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "current" && (
        <ScaleIn delay={200}>
          {!isWebDesktop ? (
            <TouchableOpacity
              style={[
                styles.fab,
                { backgroundColor: themeColors.primary[500] },
                !canCreateRate && { opacity: 0.5 },
                themeShadows.lg,
              ]}
              onPress={() => canCreateRate ? openEditModal() : Alert.alert("Error", "Para crear una tasa de cambio debe tener una moneda principal configurada y al menos una moneda secundaria.")}
              activeOpacity={0.8}
              disabled={!canCreateRate}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </ScaleIn>
      )}

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
          <View
            style={[styles.modalContent, { backgroundColor: themeColors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: themeColors.text.primary }]}
              >
                {selectedCurrencyId ? "Editar Tasa" : "Nueva Tasa"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={themeColors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Moneda</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.currencyScroll}
              >
                {currencies
                  .filter((c) => c.code !== "CUP")
                  .map((currency) => (
                    <TouchableOpacity
                      key={currency.id}
                      style={[
                        styles.currencyButton,
                        {
                          backgroundColor:
                            formData.currencyId === currency.id
                              ? themeColors.primary[500]
                              : themeColors.background,
                        },
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          currencyId: currency.id,
                        }))
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {currency.code && getCountryCode(currency.code) ? (
                          <CountryFlag
                            isoCode={getCountryCode(currency.code)!}
                            size={14}
                            style={{ borderRadius: 2 }}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.currencyButtonText,
                            {
                              color:
                                formData.currencyId === currency.id
                                  ? "#fff"
                                  : themeColors.text.primary,
                            },
                          ]}
                        >
                          {currency.symbol} {currency.code}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <Input
                label="Tasa de Referencia"
                value={formData.referenceRate}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, referenceRate: text }))
                }
                keyboardType="decimal-pad"
                placeholder="300.00"
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Input
                    label="Tasa de Compra"
                    value={formData.exactBuy}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, exactBuy: text }))
                    }
                    keyboardType="decimal-pad"
                    placeholder="285.00"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Input
                    label="Tasa de Venta"
                    value={formData.exactSell}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, exactSell: text }))
                    }
                    keyboardType="decimal-pad"
                    placeholder="315.00"
                  />
                </View>
              </View>

              {Number(formData.referenceRate) > 0 && (
                <View style={styles.previewCard}>
                  <Text
                    style={[
                      styles.previewTitle,
                      { color: themeColors.text.primary },
                    ]}
                  >
                    Márgenes Calculados
                  </Text>
                  <View style={styles.previewRow}>
                    <View style={styles.previewItem}>
                      <Text
                        style={[
                          styles.previewLabel,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        Margen Compra
                      </Text>
                      <Text
                        style={[
                          styles.previewValue,
                          { color: themeColors.financial.compra },
                        ]}
                      >
                        {formatPercent(
                          1 -
                            (Number(formData.exactBuy) ||
                              Number(formData.referenceRate)) /
                              Number(formData.referenceRate),
                        )}
                      </Text>
                    </View>
                    <View style={styles.previewItem}>
                      <Text
                        style={[
                          styles.previewLabel,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        Margen Venta
                      </Text>
                      <Text
                        style={[
                          styles.previewValue,
                          { color: themeColors.financial.venta },
                        ]}
                      >
                        {formatPercent(
                          (Number(formData.exactSell) ||
                            Number(formData.referenceRate)) /
                            Number(formData.referenceRate) -
                            1,
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <Button
                  title={
                    updateExchangeRateMutation.isPending
                      ? "Guardando..."
                      : "Guardar Tasa"
                  }
                  onPress={handleSubmit}
                  loading={updateExchangeRateMutation.isPending}
                  style={{ marginTop: 0, flex: 1 } as any}
                />

                {selectedCurrencyId !== null && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRate(selectedCurrencyId!)}
                    disabled={deleteExchangeRateMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setHistoryModalVisible(false)}
          />
          <View
            style={[styles.modalContent, { backgroundColor: themeColors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: themeColors.text.primary }]}
              >
                Historial de Tasas
              </Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  onPress={handleDownloadPDF}
                  style={styles.headerIconButton}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={themeColors.primary[500]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetHistory}
                  style={styles.headerIconButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setHistoryModalVisible(false)}
                  style={styles.headerIconButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={themeColors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={selectedRateHistory as RateHistory[]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.historyList}
              ListHeaderComponent={
                pairStats ? (
                  <View style={styles.historyHeaderContainer}>
                    <View style={styles.chartContainer}>
                      <BarChart
                        data={selectedRateHistory
                          .slice(0, 7)
                          .reverse()
                          .map((h) => ({
                            label: format(new Date(h.createdAt), "dd/MM"),
                            value: h.rate,
                            color: themeColors.primary[500],
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
                        trend={
                          pairStats.trend === "stable"
                            ? "neutral"
                            : pairStats.trend
                        }
                        trendValue={
                          pairStats.changePercentage
                            ? `${pairStats.changePercentage.toFixed(1)}%`
                            : undefined
                        }
                        style={{ flex: 1, marginRight: 8 }}
                      />
                      <StatsCard
                        title="Máximo"
                        value={formatNumber(pairStats.max)}
                        trend="neutral"
                        style={{ flex: 1 }}
                      />
                    </View>
                    <Text
                      style={[
                        styles.historyListTitle,
                        { color: themeColors.text.primary },
                      ]}
                    >
                      Últimos Movimientos
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    No hay historial para esta moneda
                  </Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Delete Confirmation Modal */}
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
  webTopBar: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  headerActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  webListContent: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  rateCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbolContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "700",
  },
  rateInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
  },
  currencyCode: {
    fontSize: 12,
  },
  rateValues: {
    alignItems: "flex-end",
  },
  rateValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rateLabel: {
    fontSize: 11,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  rateFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  rateDetail: {
    alignItems: "center",
  },
  rateDetailLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  rateDetailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  newBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  historyCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyCardManual: {
    borderLeftWidth: 4,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyCurrencySymbolContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  historyCurrencySymbol: {
    fontSize: 24,
    fontWeight: "700",
  },
  historyPairContainer: {
    marginLeft: spacing.sm,
    justifyContent: "center",
  },
  historyPair: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  historyCurrency: {
    fontSize: 15,
    fontWeight: "600",
  },
  historyDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyDate: {
    fontSize: 12,
  },
  historyRightContent: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  inlineManualBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
    marginBottom: 4,
  },
  inlineManualBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  historyRate: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.md,
    fontWeight: "500",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContent: {
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
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    marginLeft: spacing.sm,
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
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
    flexDirection: "row",
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
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  previewItem: {
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: 0,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  historyList: {
    paddingBottom: spacing.xl,
  },
  historyHeaderContainer: {
    padding: spacing.md,
  },
  chartContainer: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  historyListTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  currencyButtonActive: {
    backgroundColor: colors.primary[500],
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  currencyButtonTextActive: {
    color: "#fff",
  },
});
