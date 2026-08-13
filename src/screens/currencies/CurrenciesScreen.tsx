import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileFeatureBackButton } from "../profile/ProfileFeatureBackButton";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import CountryFlag from "react-native-country-flag";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows, useIsDark } from "../../store/themeStore";
import type { Currency } from "../../types";
import {
  useCurrenciesWithPrimaryQuery,
  useCreateCurrencyMutation,
  useSetPrimaryCurrencyMutation,
  useDeleteCurrencyMutation,
  useUpdateCurrencyMutation,
} from "../../modules/currencies/application/useCurrencies";
import { useCurrentExchangeRatesQuery } from "../../modules/exchange-rates/application/useExchangeRates";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getCountryCode, getCurrencySymbol } from "../../utils/currencyUtils";
import { CURRENCY_CONFIG } from "../../config/constants";
import { BREAKPOINTS } from "../../hooks/useResponsive";

export const CurrenciesScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDarkMode = useIsDark();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

  const styles = useMemo(
    () => createStyles(themeColors, themeShadows, isDarkMode),
    [themeColors, themeShadows, isDarkMode],
  );

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
  const currenciesQuery = useCurrenciesWithPrimaryQuery();
  const exchangeRatesQuery = useCurrentExchangeRatesQuery();
  const createCurrencyMutation = useCreateCurrencyMutation();
  const updateCurrencyMutation = useUpdateCurrencyMutation();
  const setPrimaryCurrencyMutation = useSetPrimaryCurrencyMutation();
  const deleteCurrencyMutation = useDeleteCurrencyMutation();

  const currencies = currenciesQuery.data?.currencies ?? [];
  const primaryCurrencyId = currenciesQuery.data?.primaryCurrencyId ?? null;

  const primaryCurrency = currencies.find((c) => c.id === primaryCurrencyId);
  const secondaryCurrencies = currencies.filter(
    (c) => c.id !== primaryCurrencyId && c.isActive !== false,
  );

  const exchangeRates = exchangeRatesQuery.data ?? [];
  let lastUpdateText = "Desconocido";
  if (exchangeRates.length > 0) {
    const latestDate = exchangeRates.reduce((latest, current) => {
      const currentDate = new Date(current.effectiveDate);
      return currentDate > latest ? currentDate : latest;
    }, new Date(0));

    lastUpdateText = `Tasas actualizadas hace ${formatDistanceToNow(latestDate, { locale: es })}`;
  } else if (exchangeRatesQuery.dataUpdatedAt) {
    lastUpdateText = `Tasas actualizadas hace ${formatDistanceToNow(new Date(exchangeRatesQuery.dataUpdatedAt), { locale: es })}`;
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<{
    id: number | null;
    code: string;
    name: string;
    symbol: string;
  }>({
    id: null,
    code: "",
    name: "",
    symbol: "",
  });

  const handleRefresh = async () => {
    await Promise.all([
      currenciesQuery.refetch(),
      exchangeRatesQuery.refetch(),
    ]);
  };

  const openModal = (currency?: Currency) => {
    if (currency) {
      setFormData({
        id: currency.id,
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      });
    } else {
      setFormData({ id: null, code: "", name: "", symbol: "" });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.symbol) {
      Alert.alert("Error", "Complete todos los campos");
      return;
    }

    try {
      if (formData.id) {
        await updateCurrencyMutation.mutateAsync({
          id: formData.id,
          data: {
            code: formData.code.toUpperCase(),
            name: formData.name,
            symbol: formData.symbol,
          },
        });
        Alert.alert("Éxito", "Moneda actualizada correctamente");
      } else {
        await createCurrencyMutation.mutateAsync({
          code: formData.code.toUpperCase(),
          name: formData.name,
          symbol: formData.symbol,
        });
        Alert.alert("Éxito", "Moneda creada correctamente");
      }
      setModalVisible(false);
      setFormData({ id: null, code: "", name: "", symbol: "" });
    } catch (error) {
      Alert.alert(
        "Error",
        formData.id
          ? "No se pudo actualizar la moneda"
          : "No se pudo crear la moneda",
      );
    }
  };

  const handleSetPrimary = async (currencyId: number) => {
    try {
      await setPrimaryCurrencyMutation.mutateAsync(currencyId);
      Alert.alert("Éxito", "Moneda principal actualizada");
    } catch (error) {
      Alert.alert("Error", "No se pudo establecer la moneda principal");
    }
  };

  const handleDelete = (currency: Currency) => {
    if (currency.code === CURRENCY_CONFIG.BASE_CODE) {
      Alert.alert(
        "Acción no permitida",
        `La moneda base (${CURRENCY_CONFIG.BASE_CODE}) no puede ser eliminada.`,
      );
      return;
    }

    setConfirmModal({
      visible: true,
      title: "Quitar Moneda",
      message: `¿Estás seguro de que deseas quitar ${currency.code}?`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        try {
          await deleteCurrencyMutation.mutateAsync(currency.id);
          Alert.alert("Éxito", "Moneda eliminada correctamente");
        } catch (error) {
          Alert.alert("Error", "No se pudo eliminar la moneda");
        }
      },
    });
  };

  const renderSecondaryCurrencyItem = (item: Currency) => {
    const countryCode = getCountryCode(item.code);
    return (
      <View style={styles.secondaryCard}>
        <View style={styles.secondaryCardFlagContainer}>
          {countryCode ? (
            <CountryFlag
              isoCode={countryCode}
              size={24}
              style={styles.flagStyle}
            />
          ) : (
            <View style={styles.placeholderFlag} />
          )}
        </View>
        <Text style={styles.secondaryCardCode}>{item.code}</Text>
        <Text style={styles.secondaryCardName}>{item.name}</Text>
        <Text style={styles.secondaryCardSymbol}>
          {item.symbol} {item.code}
        </Text>

        <TouchableOpacity
          style={styles.secondaryCardBtnPrimary}
          onPress={() => handleSetPrimary(item.id)}
        >
          <Ionicons
            name="star"
            size={14}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.secondaryCardBtnPrimaryText}>PRINCIPAL</Text>
        </TouchableOpacity>

        <View style={styles.secondaryCardActions}>
          <TouchableOpacity
            style={styles.secondaryCardBtnEdit}
            onPress={() => openModal(item)}
          >
            <Ionicons
              name="pencil"
              size={14}
              color={themeColors.text.secondary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.secondaryCardBtnEditText}>EDITAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryCardBtnDelete}
            onPress={() => handleDelete(item)}
          >
            <Ionicons
              name="trash"
              size={14}
              color={themeColors.danger}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.secondaryCardBtnDeleteText}>QUITAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {isWebDesktop ? (
        <View style={styles.webTopBar}>
          <ProfileFeatureBackButton />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Nueva moneda"
            onPress={() => openModal()}
            style={[
              styles.headerAction,
              { backgroundColor: themeColors.primary[500] },
            ]}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.headerActionText}>Nueva moneda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ProfileFeatureBackButton />
      )}
      {currenciesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonPrimary} />
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonBadge} />
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonCard} />
              <View style={styles.skeletonCard} />
            </View>
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isWebDesktop && styles.webScrollContent,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={currenciesQuery.isRefetching}
                onRefresh={handleRefresh}
                tintColor={themeColors.primary[500]}
              />
            }
          >
            {/* Primary Currency Section */}
            <FadeIn>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>MONEDA PRINCIPAL</Text>
                <View style={styles.primaryBadgeSmall}>
                  <View style={styles.primaryDot} />
                  <Text style={styles.primaryBadgeSmallText}>PRINCIPAL</Text>
                </View>
              </View>

              {primaryCurrency ? (
                <TouchableOpacity
                  style={styles.primaryCard}
                  onPress={() => openModal(primaryCurrency)}
                  activeOpacity={0.85}
                >
                  <View style={styles.primaryCardTop}>
                    <View style={styles.primaryFlagPlaceholder}>
                      {getCountryCode(primaryCurrency.code) ? (
                        <CountryFlag
                          isoCode={getCountryCode(primaryCurrency.code)!}
                          size={20}
                          style={styles.flagStyle}
                        />
                      ) : (
                        <View style={[styles.primaryFlagPlaceholder, { backgroundColor: themeColors.text.tertiary }]} />
                      )}
                    </View>
                    <Text style={styles.primaryCode}>{primaryCurrency.code}</Text>
                    <Ionicons
                      name="earth"
                      size={80}
                      color="rgba(255,255,255,0.1)"
                      style={styles.primaryCardBgIcon}
                    />
                  </View>
                  <Text style={styles.primaryName}>{primaryCurrency.name}</Text>

                  <View style={styles.primaryCardBottom}>
                    <View style={styles.primaryInfoBlock}>
                      <Text style={styles.primaryInfoLabel}>SÍMBOLO</Text>
                      <Text style={styles.primaryInfoValue}>
                        {primaryCurrency.symbol}{" "}
                        {primaryCurrency.code === CURRENCY_CONFIG.BASE_CODE ? "MN" : ""}
                      </Text>
                    </View>
                    <View style={styles.primaryDivider} />
                    <View style={styles.primaryInfoBlock}>
                      <Text style={styles.primaryInfoLabel}>ESTADO</Text>
                      <Text style={styles.primaryInfoValue}>Configurado</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.primaryCard,
                    {
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 40,
                    },
                  ]}
                >
                  <Text style={styles.primaryEmptyText}>
                    No hay moneda principal configurada
                  </Text>
                  <Text>
                    {" "}
                  </Text>
                  <Button
                    title="Configurar"
                    onPress={() => openModal()}
                    style={{
                      marginTop: 16,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  />
                </View>
              )}
            </FadeIn>

            {/* Secondary Currencies Section */}
            <FadeIn delay={100}>
              <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                <Text style={styles.sectionTitleDark}>Otras Monedas</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    {secondaryCurrencies.length} ACTIVAS
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                contentContainerStyle={styles.secondaryListContent}
                showsHorizontalScrollIndicator={false}
              >
                {secondaryCurrencies.length === 0 ? (
                  <View style={styles.secondaryEmpty}>
                    <Text style={styles.secondaryEmptyText}>
                      No hay otras monedas
                    </Text>
                  </View>
                ) : (
                  secondaryCurrencies.map((item, index) => (
                    <FadeInDown key={item.id} delay={index * 50}>
                      {renderSecondaryCurrencyItem(item)}
                    </FadeInDown>
                  ))
                )}
              </ScrollView>
            </FadeIn>

            {/* Market Status Section */}
            <FadeIn delay={200}>
              <View style={styles.marketStatusCard}>
                <View style={styles.marketStatusIcon}>
                  <Ionicons name="refresh" size={24} color={themeColors.primary[600]} />
                </View>
                <View style={styles.marketStatusInfo}>
                  <Text style={styles.marketStatusLabel}>ESTADO DEL MERCADO</Text>
                  <Text style={styles.marketStatusTitle}>{lastUpdateText}</Text>
                  <Text style={styles.marketStatusDesc}>
                    Sincronizado con exchange rates
                  </Text>
                </View>
              </View>
            </FadeIn>
          </ScrollView>
        </>
      )}

      <ScaleIn delay={200}>
        {!isWebDesktop ? (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => openModal()}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </ScaleIn>

      {/* Modal Nueva/Editar Moneda */}
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
                {formData.id ? "Editar Moneda" : "Nueva Moneda"}
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
              <Input
                label="Código (ISO 4217)"
                value={formData.code}
                onChangeText={(text) => {
                  const upperText = text.toUpperCase();
                  setFormData((prev) => {
                    const updates: typeof prev = { ...prev, code: upperText };
                    if (upperText.length >= 2 && !prev.symbol) {
                      const newSymbol = getCurrencySymbol(upperText);
                      if (newSymbol && newSymbol !== "$") {
                        updates.symbol = newSymbol;
                      } else if (newSymbol === "$" && ["USD", "CUP", "MLC", "CAD", "MXN", "COP", "ARS", "CLP", "AUD", "NZD"].includes(upperText)) {
                        updates.symbol = "$";
                      }
                    }
                    return updates;
                  });
                }}
                placeholder="ej. USD"
                autoCapitalize="characters"
                maxLength={3}
              />

              <Input
                label="Nombre"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="ej. Dólar Estadounidense"
              />

              <Input
                label="Símbolo"
                value={formData.symbol}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, symbol: text }))
                }
                placeholder="ej. $"
              />

              <Button
                title={
                  createCurrencyMutation.isPending ||
                  updateCurrencyMutation.isPending
                    ? "Guardando..."
                    : "Guardar Moneda"
                }
                onPress={handleSubmit}
                loading={
                  createCurrencyMutation.isPending ||
                  updateCurrencyMutation.isPending
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

const createStyles = (
  c: ReturnType<typeof useColors>,
  s: ReturnType<typeof useShadows>,
  isDark: boolean,
) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
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
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.primary[500],
    alignItems: "center",
    justifyContent: "center",
    ...s.lg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  webScrollContent: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: c.text.secondary,
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text.primary,
  },
  primaryBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.secondary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.secondary[500],
    marginRight: 4,
  },
  primaryBadgeSmallText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.secondary[700],
  },
  activeBadge: {
    backgroundColor: c.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.text.secondary,
  },
  primaryCard: {
    backgroundColor: isDark ? "#0C3D49" : c.primary[600],
    borderRadius: 24,
    padding: spacing.xl,
    overflow: "hidden",
    ...s.lg,
  },
  primaryEditBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.card,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    position: "relative",
  },
  primaryFlagPlaceholder: {
    width: 32,
    height: 20,
    backgroundColor: c.text.tertiary,
    borderRadius: 4,
    marginRight: spacing.sm,
    overflow: "hidden",
    position: "relative",
  },
  primaryCode: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  primaryCardBgIcon: {
    position: "absolute",
    right: -20,
    top: -20,
  },
  primaryName: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: spacing.xl,
  },
  primaryCardBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryInfoBlock: {
    flex: 1,
  },
  primaryInfoLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  primaryInfoValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  primaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.lg,
  },
  primaryEmptyText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  secondaryListContent: {
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  secondaryEmpty: {
    padding: spacing.lg,
    backgroundColor: c.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: c.border,
  },
  secondaryEmptyText: {
    color: c.text.secondary,
  },
  secondaryCard: {
    backgroundColor: c.card,
    borderRadius: 24,
    padding: spacing.lg,
    marginRight: spacing.md,
    width: 180,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: "center",
    ...s.sm,
  },
  secondaryCardFlagContainer: {
    width: 48,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  flagStyle: {
    borderRadius: 4,
  },
  placeholderFlag: {
    width: 32,
    height: 24,
    backgroundColor: c.surface,
    borderRadius: 4,
  },
  secondaryCardCode: {
    fontSize: 20,
    fontWeight: "800",
    color: c.primary[700],
    marginBottom: 2,
  },
  secondaryCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: c.text.primary,
    marginBottom: 2,
  },
  secondaryCardSymbol: {
    fontSize: 12,
    color: c.text.secondary,
    marginBottom: spacing.lg,
  },
  secondaryCardBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#0C3D49" : c.primary[600],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  secondaryCardBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  secondaryCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
  },
  secondaryCardBtnEdit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surface,
    paddingVertical: 8,
    borderRadius: 12,
  },
  secondaryCardBtnEditText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.text.secondary,
  },
  secondaryCardBtnDelete: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? "rgba(239,68,68,0.15)" : c.financial.expenseLight,
    paddingVertical: 8,
    borderRadius: 12,
  },
  secondaryCardBtnDeleteText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.danger,
  },
  marketStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.card,
    borderRadius: 24,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: c.border,
    ...s.sm,
  },
  marketStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: c.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  marketStatusInfo: {
    flex: 1,
  },
  marketStatusLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: c.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  marketStatusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: c.text.primary,
    marginBottom: 2,
  },
  marketStatusDesc: {
    fontSize: 12,
    color: c.text.tertiary,
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "transparent" },
  modalContent: {
    backgroundColor: c.card,
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
  modalTitle: { fontSize: 20, fontWeight: "700", color: c.text.primary },
  submitButton: { marginTop: spacing.md },
  loadingContainer: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonPrimary: {
    height: 180,
    backgroundColor: c.surface,
    borderRadius: 24,
  },
  skeletonSection: {
    gap: spacing.sm,
  },
  skeletonBadge: {
    width: 80,
    height: 20,
    backgroundColor: c.surface,
    borderRadius: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  skeletonCard: {
    width: 180,
    height: 200,
    backgroundColor: c.surface,
    borderRadius: 24,
  },
});
