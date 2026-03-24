import React, { useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { useColors, useShadows } from "../../../store/themeStore";
import { borderRadius, spacing } from "../../../theme";
import { licensesApi, BillingCycle } from "../../../api/licensesApi";
import api from "../../../services/api";

type ExtendLicenseModalProps = {
  visible: boolean;
  licenseId: string;
  currentExpiry: Date;
  currentPlanId: number;
  currentCycle: BillingCycle;
  onCancel: () => void;
  onSuccess: () => void;
};

const EXTENSION_OPTIONS = [
  { days: 30, label: "30 días" },
  { days: 60, label: "60 días" },
  { days: 90, label: "90 días" },
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
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>("");

  const newExpiry = (() => {
    const days = customDays.trim() ? parseInt(customDays, 10) : selectedDays;
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    return addDays(baseDate, days);
  })();

  const handleExtend = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.patch(`/subscriptions/licenses/${licenseId}/renew`, {
        planId: currentPlanId,
        cycle: currentCycle,
      });
      onSuccess();
    } catch (err: unknown) {
      console.error("Error extending license:", err);
      const message =
        err instanceof Error ? err.message : "Error al extender la licencia";
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
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
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

          {/* Current vs New Expiry */}
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

          {/* Extension Period Options */}
          <Text style={styles.sectionTitle}>
            Seleccionar período de extensión
          </Text>
          <View style={styles.optionsRow}>
            {EXTENSION_OPTIONS.map((option) => {
              const isSelected =
                customDays.trim() === "" && selectedDays === option.days;
              return (
                <TouchableOpacity
                  key={option.days}
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
                  onPress={() => {
                    setSelectedDays(option.days);
                    setCustomDays("");
                  }}
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

          {/* Custom Days Input */}
          <View style={styles.customRow}>
            <Text style={styles.customLabel}>O personalizado:</Text>
            <View style={styles.customInput}>
              <TouchableOpacity
                style={[
                  styles.customOption,
                  customDays.trim() !== "" && {
                    borderColor: colors.primary[500],
                    backgroundColor: `${colors.primary[500]}10`,
                  },
                ]}
                onPress={() => {}}
              >
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputText}>Días:</Text>
                  <View style={styles.inputField}>
                    <TouchableOpacity
                      style={styles.inputValue}
                      onPress={() => {
                        // Focus logic handled by native
                      }}
                    >
                      <View style={styles.textInputContainer}>
                        <TextInput
                          style={styles.textInput}
                          value={customDays}
                          onChangeText={(text) => {
                            const num = text.replace(/[^0-9]/g, "");
                            setCustomDays(num);
                          }}
                          placeholder="0"
                          placeholderTextColor={colors.text.tertiary}
                          keyboardType="number-pad"
                          maxLength={3}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plan Info */}
          <View style={styles.planInfo}>
            <Text style={styles.planInfoText}>
              Plan: {currentCycle ? CYCLE_LABELS[currentCycle] : "N/A"}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
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
            >
              <Text style={styles.confirmText}>
                {loading ? "Extendiendo..." : "Confirmar Extensión"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Simple TextInput without using the custom Input component
import { TextInput } from "react-native";

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
    customInput: {
      flex: 1,
    },
    customOption: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    inputText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    inputField: {
      flex: 1,
    },
    inputValue: {
      flex: 1,
    },
    textInputContainer: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
    },
    textInput: {
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
      height: 50,
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
      height: 50,
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
