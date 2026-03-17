import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionGridItemProps {
  icon: string;
  label: string;
  description: string;
  color?: string;
  onPress: () => void;
}

export const ActionGridItem: React.FC<ActionGridItemProps> = ({ 
  icon, 
  label, 
  description, 
  color, 
  onPress 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const iconColor = color || (isDark ? '#94a3b8' : '#64748b');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

const getStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#f1f5f9',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#64748b',
    lineHeight: 16,
  },
});
