import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../../components/animations";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import { useToastStore } from "../../store/toastStore";

type ReportFormat = "PDF" | "EXCEL";
type DateRange = { start: string; end: string };

const INCLUDED_DATA_OPTIONS = [
  { id: "kpis", label: "Key Performance Indicators (KPIs)", icon: "bar-chart" },
  { id: "users", label: "User Activity List", icon: "people" },
  { id: "audit", label: "Security & Audit Log", icon: "shield-checkmark" },
] as const;

export const AdminExportReportsScreen: React.FC = () => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const { addToast } = useToastStore();

  const [format, setFormat] = useState<ReportFormat>("PDF");
  const [selectedData, setSelectedData] = useState<Record<string, boolean>>({
    kpis: true,
    users: true,
    audit: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleDataSelection = (id: string) => {
    setSelectedData((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExport = () => {
    const hasSelection = Object.values(selectedData).some(Boolean);
    if (!hasSelection) {
      addToast("Selecciona al menos un tipo de dato a exportar", "error");
      return;
    }

    setIsExporting(true);
    setProgress(0);

    // Simular el proceso de exportación
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            addToast("Reporte exportado y descargado exitosamente", "success");
            navigation.goBack();
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <View style={styles.modalOverlay}>
      <FadeInDown duration={300} style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Reports</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REPORT FORMAT</Text>
          <View style={styles.formatSegment}>
            <TouchableOpacity
              style={[
                styles.formatOption,
                format === "PDF" && styles.formatOptionActive,
              ]}
              onPress={() => setFormat("PDF")}
            >
              <Text
                style={[
                  styles.formatText,
                  format === "PDF" && styles.formatTextActive,
                ]}
              >
                PDF
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.formatOption,
                format === "EXCEL" && styles.formatOptionActive,
              ]}
              onPress={() => setFormat("EXCEL")}
            >
              <Text
                style={[
                  styles.formatText,
                  format === "EXCEL" && styles.formatTextActive,
                ]}
              >
                Excel (XLSX)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Included Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INCLUDED DATA</Text>
          <View style={styles.dataList}>
            {INCLUDED_DATA_OPTIONS.map((option) => {
              const isSelected = selectedData[option.id];
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.dataRow, isSelected && styles.dataRowSelected]}
                  onPress={() => toggleDataSelection(option.id)}
                >
                  <View style={styles.dataIconContainer}>
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={colors.primary[500]}
                    />
                  </View>
                  <Text style={styles.dataLabel}>{option.label}</Text>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={colors.text.inverse}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Range (Simplified static view based on design) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATE RANGE</Text>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.calendarTitle}>October 2023</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.secondary}
              />
            </View>
            <View style={styles.weekDays}>
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.daysRow}>
              {/* Simplified mock calendar line to match design */}
              <View style={styles.emptyDay} />
              <View style={styles.emptyDay} />
              <View style={styles.emptyDay} />
              <Text style={styles.dayText}>1</Text>
              <Text style={styles.dayText}>2</Text>
              <Text style={styles.dayText}>3</Text>
              <Text style={styles.dayText}>4</Text>
            </View>
            <View style={styles.daysRow}>
              <View
                style={[
                  styles.dayCell,
                  styles.daySelectedBg,
                  { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
                ]}
              >
                <Text style={[styles.dayText, styles.daySelectedText]}>5</Text>
              </View>
              <View style={[styles.dayCell, styles.daySelectedBg]}>
                <Text style={[styles.dayText, styles.daySelectedText]}>6</Text>
              </View>
              <View style={[styles.dayCell, styles.daySelectedBg]}>
                <Text style={[styles.dayText, styles.daySelectedText]}>7</Text>
              </View>
              <View style={[styles.dayCell, styles.daySelectedBg]}>
                <Text style={[styles.dayText, styles.daySelectedText]}>8</Text>
              </View>
              <View style={[styles.dayCell, styles.daySelectedBg]}>
                <Text style={[styles.dayText, styles.daySelectedText]}>9</Text>
              </View>
              <View style={[styles.dayCell, styles.daySelectedEnd]}>
                <Text style={[styles.dayText, styles.daySelectedEndText]}>
                  10
                </Text>
              </View>
              <Text style={styles.dayText}>11</Text>
            </View>
          </View>
        </View>

        {/* Export Progress */}
        {isExporting && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTitleRow}>
                <Ionicons
                  name="cloud-download"
                  size={18}
                  color={colors.primary[500]}
                />
                <Text style={styles.progressTitle}>Preparing Download...</Text>
              </View>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressSubtitle}>
              Compressing data and generating encryption tokens.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isExporting && styles.primaryButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={colors.text.inverse}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryButtonText}>
                  Generate & Download
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isExporting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </FadeInDown>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xl,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    headerRight: {
      width: 40,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text.secondary,
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    formatSegment: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderRadius: borderRadius.full,
      padding: 4,
    },
    formatOption: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: borderRadius.full,
    },
    formatOptionActive: {
      backgroundColor: colors.surface,
    },
    formatText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    formatTextActive: {
      color: colors.text.primary,
    },
    dataList: {
      gap: spacing.sm,
    },
    dataRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: "transparent",
    },
    dataRowSelected: {
      borderColor: colors.border,
    },
    dataIconContainer: {
      width: 32,
      alignItems: "center",
    },
    dataLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.text.primary,
      fontWeight: "500",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    checkboxSelected: {
      backgroundColor: colors.primary[500] || "#1D8FFF",
      borderColor: colors.primary[500] || "#1D8FFF",
    },
    calendarCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
    },
    calendarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    calendarTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text.primary,
    },
    weekDays: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    weekDayText: {
      width: 32,
      textAlign: "center",
      fontSize: 11,
      color: colors.text.secondary,
      fontWeight: "600",
    },
    daysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    emptyDay: {
      width: 32,
      height: 32,
    },
    dayCell: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      width: 32,
      height: 32,
      textAlign: "center",
      lineHeight: 32,
      fontSize: 14,
      color: colors.text.primary,
    },
    daySelectedBg: {
      backgroundColor: `${colors.primary[500]}33` || "#1D8FFF33",
    },
    daySelectedText: {
      color: colors.primary[500] || "#1D8FFF",
      fontWeight: "600",
    },
    daySelectedEnd: {
      backgroundColor: colors.primary[500] || "#1D8FFF",
      borderRadius: 16,
    },
    daySelectedEndText: {
      color: colors.text.inverse,
      fontWeight: "700",
    },
    progressCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: `${colors.primary[500]}33`,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    progressTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    progressTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary[500],
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary[500],
    },
    progressBarTrack: {
      height: 6,
      backgroundColor: colors.surface,
      borderRadius: 3,
      marginBottom: spacing.sm,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary[500],
      borderRadius: 3,
    },
    progressSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    footer: {
      gap: spacing.md,
    },
    primaryButton: {
      backgroundColor: colors.primary[500] || "#1D8FFF",
      height: 56,
      borderRadius: borderRadius.full,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonDisabled: {
      opacity: 0.7,
    },
    primaryButtonText: {
      color: colors.text.inverse,
      fontSize: 16,
      fontWeight: "700",
    },
    cancelButton: {
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      color: colors.text.secondary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
