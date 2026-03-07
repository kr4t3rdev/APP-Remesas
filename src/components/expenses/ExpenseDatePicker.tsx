import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';

type ExpenseDatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  error?: string;
};

export const ExpenseDatePicker: React.FC<ExpenseDatePickerProps> = ({
  value,
  onChange,
  label = 'Fecha',
  error,
}) => {
  const themeColors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    onChange(selectedDate.toISOString().split('T')[0]);
    setShowPicker(false);
  };

  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) days.push(i);
    return days;
  };

  const generateMonths = () => [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) years.push(i);
    return years;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.text.primary }]}>{label}</Text>
      <TouchableOpacity
        testID="expense-date-picker"
        onPress={() => setShowPicker(true)}
        style={[
          styles.inputContainer,
          { borderColor: error ? themeColors.danger : themeColors.border },
        ]}
      >
        <Ionicons name="calendar-outline" size={20} color={themeColors.text.secondary} />
        <Text style={[styles.dateText, { color: value ? themeColors.text.primary : themeColors.text.tertiary }]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: themeColors.danger }]}>{error}</Text>
      )}

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                Seleccionar fecha
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: themeColors.text.secondary }]}>Día</Text>
                <View style={styles.pickerScroll}>
                  {generateDays().map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDate.getDate() === day && { backgroundColor: themeColors.primary[500] },
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: selectedDate.getDate() === day ? '#fff' : themeColors.text.primary },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: themeColors.text.secondary }]}>Mes</Text>
                <View style={styles.pickerScroll}>
                  {generateMonths().map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedDate.getMonth() === index && { backgroundColor: themeColors.primary[500] },
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(index);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: selectedDate.getMonth() === index ? '#fff' : themeColors.text.primary },
                        ]}
                      >
                        {month.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: themeColors.text.secondary }]}>Año</Text>
                <View style={styles.pickerScroll}>
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedDate.getFullYear() === year && { backgroundColor: themeColors.primary[500] },
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setFullYear(year);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: selectedDate.getFullYear() === year ? '#fff' : themeColors.text.primary },
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              testID="expense-date-confirm"
              style={[styles.confirmButton, { backgroundColor: themeColors.primary[500] }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dateText: {
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginBottom: 2,
  },
  pickerItemText: {
    fontSize: 14,
  },
  confirmButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
