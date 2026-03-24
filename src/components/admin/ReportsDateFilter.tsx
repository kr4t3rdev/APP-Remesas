import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";

type DateFilterProps = {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (date: string | undefined) => void;
  onDateToChange: (date: string | undefined) => void;
  delay?: number;
};

export const DateFilter: React.FC<DateFilterProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  delay = 80,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Seleccionar";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const hasFilters = dateFrom || dateTo;

  const handleClear = () => {
    onDateFromChange(undefined);
    onDateToChange(undefined);
  };

  // Simple date input handlers - in production, use a proper date picker library
  const handleFromPress = () => {
    setShowFromPicker(!showFromPicker);
    setShowToPicker(false);
  };

  const handleToPress = () => {
    setShowToPicker(!showToPicker);
    setShowFromPicker(false);
  };

  // Quick date presets
  const presets = [
    { label: "Hoy", days: 0 },
    { label: "7 días", days: 7 },
    { label: "30 días", days: 30 },
    { label: "Este mes", days: -1 },
    { label: "Mes pasado", days: -2 },
  ];

  const applyPreset = (days: number) => {
    const today = new Date();
    const fromDate = new Date();

    if (days === 0) {
      // Today
      onDateFromChange(today.toISOString().split("T")[0]);
      onDateToChange(today.toISOString().split("T")[0]);
    } else if (days === -1) {
      // This month
      fromDate.setDate(1);
      onDateFromChange(fromDate.toISOString().split("T")[0]);
      onDateToChange(today.toISOString().split("T")[0]);
    } else if (days === -2) {
      // Last month
      fromDate.setMonth(fromDate.getMonth() - 1);
      fromDate.setDate(1);
      const toDate = new Date();
      toDate.setDate(0);
      onDateFromChange(fromDate.toISOString().split("T")[0]);
      onDateToChange(toDate.toISOString().split("T")[0]);
    } else {
      fromDate.setDate(today.getDate() - days);
      onDateFromChange(fromDate.toISOString().split("T")[0]);
      onDateToChange(today.toISOString().split("T")[0]);
    }
  };

  return (
    <FadeInDown delay={delay} duration={300}>
      <View style={styles.container}>
        <Text style={styles.label}>Período</Text>

        {/* Quick presets */}
        <View style={styles.presetsRow}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={styles.presetButton}
              onPress={() => applyPreset(preset.days)}
            >
              <Text style={styles.presetText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date inputs */}
        <View style={styles.inputsRow}>
          <TouchableOpacity style={styles.dateButton} onPress={handleFromPress}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={[styles.dateText, dateFrom && styles.dateTextActive]}>
              {formatDate(dateFrom)}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>—</Text>

          <TouchableOpacity style={styles.dateButton} onPress={handleToPress}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={[styles.dateText, dateTo && styles.dateTextActive]}>
              {formatDate(dateTo)}
            </Text>
          </TouchableOpacity>

          {hasFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros de fecha"
            >
              <Ionicons name="close-circle" size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* Simple text input for dates (fallback) */}
        {(showFromPicker || showToPicker) && (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Desde (YYYY-MM-DD)</Text>
              <View style={styles.textInput}>
                <Text style={styles.textInputPlaceholder}>
                  {dateFrom || "Ej: 2024-01-01"}
                </Text>
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Hasta (YYYY-MM-DD)</Text>
              <View style={styles.textInput}>
                <Text style={styles.textInputPlaceholder}>
                  {dateTo || "Ej: 2024-01-31"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </FadeInDown>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    presetsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    presetButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    inputsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    dateButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 44,
    },
    dateText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    dateTextActive: {
      color: colors.text.primary,
      fontWeight: "500",
    },
    dateSeparator: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    clearButton: {
      padding: spacing.xs,
    },
    inputContainer: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    inputWrapper: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    textInput: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textInputPlaceholder: {
      fontSize: 13,
      color: colors.text.secondary,
    },
  });
