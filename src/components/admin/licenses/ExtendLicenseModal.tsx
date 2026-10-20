import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { useColors, useShadows } from "../../../store/themeStore";
import { borderRadius, spacing } from "../../../theme";
import { licensesApi, BillingCycle } from "../../../api/licensesApi";

type ExtendLicenseModalProps = {
  visible: boolean;
  licenseId: string;
  currentExpiry: Date;
  currentPlanId: number;
  currentCycle: BillingCycle;
  onCancel: () => void;
  onSuccess: () => void;
};

// The backend renews licenses by billing cycle only
// (PATCH /subscriptions/licenses/:id/renew { planId, cycle }),
// mirroring CYCLE_DAYS in the API: MONTHLY=30, SEMIANNUAL=180, ANNUAL=365.
const EXTENSION_OPTIONS: { cycle: BillingCycle; days: number; label: string }[] = [
  { cycle: "MONTHLY", days: 30, label: "Mensual" },
  { cycle: "SEMIANNUAL", days: 180, label: "Semestral" },
  { cycle: "ANNUAL", days: 365, label: "Anual" },
];

const CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Mensual",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export const ExtendLicenseModal: React.FC<ExtendLicenseModalProps> = ({
  visible,
  licenseId,
  currentExpiry,
  currentPlanId,
  currentCycle,
  onCancel,
  onSuccess,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(currentCycle);

  useEffect(() => {
    if (visible) setSelectedCycle(currentCycle);
  }, [visible, currentCycle]);

  const effectiveDays =
    EXTENSION_OPTIONS.find((option) => option.cycle === selectedCycle)?.days ?? 30;
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = addDays(baseDate, effectiveDays);

  const handleExtend = async () => {
    if (!licenseId || !currentPlanId) {
      setError("No se pudo identificar el plan de la licencia");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await licensesApi.extendLicense(licenseId, currentPlanId, selectedCycle);
      onSuccess();
    } catch (err: unknown) {
      console.error("Error extending license:", err);
      const backendMessage = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      const message =
        backendMessage ||
        (err instanceof Error ? err.message : "Error al extender la licencia");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.dialog}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.primary[500]}20` },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={32}
              color={colors.primary[500]}
            />
          </View>

          <Text style={styles.title}>Extender Licencia</Text>

          <View style={styles.datePreview}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Fecha actual:</Text>
              <Text style={styles.dateValue}>
                {format(currentExpiry, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </Text>
            </View>
            <View style={styles.arrowRow}>
              <Ionicons
                name="arrow-down"
                size={16}
                color={colors.text.secondary}
              />
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Nueva fecha:</Text>
              <Text
                style={[
                  styles.dateValue,
                  { color: colors.primary[500], fontWeight: "700" },
                ]}
              >
                {format(newExpiry, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Seleccionar período de extensión
          </Text>
          <View style={styles.optionsRow}>
            {EXTENSION_OPTIONS.map((option) => {
              const isSelected = selectedCycle === option.cycle;
              return (
                <TouchableOpacity
                  key={option.cycle}
                  style={[
                    styles.optionItem,
                    {
                      borderColor: isSelected
                        ? colors.primary[500]
                        : colors.border,
                    },
                    isSelected && {
                      backgroundColor: `${colors.primary[500]}10`,
                    },
                  ]}
                  onPress={() => setSelectedCycle(option.cycle)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Extender ciclo ${option.label}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && {
                        color: colors.primary[500],
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.planInfo}>
            <Text style={styles.planInfoText}>
              Plan ID {currentPlanId} · Ciclo: {CYCLE_LABELS[selectedCycle]} (+{effectiveDays} días)
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancelar extensión"
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor: colors.primary[500],
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleExtend}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Confirmar extensión de licencia"
            >
              <Text style={styles.confirmText}>
                {loading ? "Extendiendo..." : "Confirmar Extensión"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    dialog: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: spacing.xl,
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    datePreview: {
      width: "100%",
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    arrowRow: {
      alignItems: "center",
      paddingVertical: spacing.xs,
    },
    dateLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      alignSelf: "flex-start",
      marginBottom: spacing.sm,
    },
    optionsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      width: "100%",
      marginBottom: spacing.md,
    },
    optionItem: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      alignItems: "center",
    },
    optionText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    customRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    customLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    customOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.background,
    },
    inputText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    textInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      paddingVertical: spacing.xs,
      minWidth: 50,
      textAlign: "center",
    },
    planInfo: {
      width: "100%",
      padding: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    planInfoText: {
      fontSize: 13,
      color: colors.text.secondary,
      textAlign: "center",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      width: "100%",
      padding: spacing.sm,
      backgroundColor: `${colors.danger}10`,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      flex: 1,
    },
    actions: {
      width: "100%",
      gap: spacing.md,
    },
    confirmButton: {
      width: "100%",
      minHeight: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    confirmText: {
      color: colors.text.inverse,
      fontSize: 16,
      fontWeight: "600",
    },
    cancelButton: {
      width: "100%",
      minHeight: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelText: {
      color: colors.text.secondary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
