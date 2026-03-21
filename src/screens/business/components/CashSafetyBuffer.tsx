import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../store/themeStore';

interface Props {
  percentage: number; // 0 to 100
  recommendedDeposit: number;
}

export const CashSafetyBuffer = ({ percentage, recommendedDeposit }: Props) => {
  const colors = useColors();

  // Constantes para simular el semicírculo
  const SIZE = 160;
  const STROKE_WIDTH = 12;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  
  // Limitar el porcentaje entre 0 y 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calcular la rotación del semicírculo basado en el porcentaje
  // 0% = 0 grados, 100% = 180 grados
  const rotationDegrees = (clampedPercentage / 100) * 180;

  let progressColor = '#047857'; // Verde oscuro si está bien
  if (clampedPercentage > 80) progressColor = '#1D4ED8'; // Azul si está cerca del límite
  if (clampedPercentage >= 95) progressColor = '#DC2626'; // Rojo si está al límite

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text.secondary }]}>CASH SAFETY BUFFER</Text>
      
      <View style={[styles.chartContainer, { width: SIZE, height: SIZE / 2 }]}>
        {/* Semicírculo de fondo (gris) */}
        <View style={[
          styles.halfCircle,
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: STROKE_WIDTH,
            borderColor: '#E5E7EB',
            borderBottomColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: '45deg' }] // Ajuste para que empiece desde abajo
          }
        ]} />
        
        {/* Semicírculo de progreso */}
        <View style={[
          styles.halfCircle,
          styles.absoluteFill,
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: STROKE_WIDTH,
            borderColor: progressColor,
            borderBottomColor: 'transparent',
            borderRightColor: 'transparent',
            // Rotación base de 45deg (oculto) + rotación calculada
            transform: [{ rotate: `${45 + rotationDegrees}deg` }]
          }
        ]} />

        {/* Cobertura inferior para ocultar la parte que no debe verse del semicírculo rotado */}
        <View style={[styles.mask, { backgroundColor: colors.card, width: SIZE + STROKE_WIDTH, height: SIZE / 2 }]} />

        {/* Texto central */}
        <View style={styles.centerTextContainer}>
          <Text style={[styles.percentageText, { color: colors.text.primary }]}>{clampedPercentage}%</Text>
          <Text style={[styles.capacityText, { color: colors.text.secondary }]}>CAPACITY REACHED</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.text.secondary }]}>
        Based on your current transaction volume, we recommend depositing <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>${recommendedDeposit.toLocaleString()}</Text> to stay within insurance limits.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden', // Importante para cortar la mitad inferior
    position: 'relative',
    marginBottom: 20,
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mask: {
    position: 'absolute',
    top: '100%',
    left: -6, // Compensar el stroke
  },
  centerTextContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  capacityText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
