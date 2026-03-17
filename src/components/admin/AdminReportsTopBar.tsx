import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

type AdminReportsTopBarProps = {
  onBack: () => void;
  onSettings: () => void;
};

export const AdminReportsTopBar: React.FC<AdminReportsTopBarProps> = ({ onBack, onSettings }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Volver a inicio admin"
        testID="admin-reports-back-button"
        onPress={onBack}
        style={styles.iconButton}
      >
        <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title} testID="admin-reports-title">
        Reportes Administrativos
      </Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Abrir configuración de perfil admin"
        testID="admin-reports-settings-button"
        onPress={onSettings}
        style={styles.iconButton}
      >
        <Ionicons name="settings" size={22} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    iconButton: {
      width: 46,
      height: 46,
      borderRadius: borderRadius.full,
      backgroundColor: '#0F213A',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#173861',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '700',
      paddingHorizontal: spacing.sm,
    },
  });
