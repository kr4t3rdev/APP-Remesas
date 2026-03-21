import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../store/themeStore';

export const CurrenciesTab = () => {
  const colors = useColors();

  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text.secondary }}>Sección de Monedas y Tasas de Cambio</Text>
      <Text style={{ color: colors.text.secondary, marginTop: 8, fontSize: 12 }}>
        (La implementación detallada requerirá endpoints específicos)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
