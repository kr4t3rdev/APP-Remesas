import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

type Props = {
  activeItem?: string
}

export const BottomNav: React.FC<Props> = ({ activeItem = 'Servicios' }) => {
  const items = ['Inicio', 'Servicios', 'Reportes', 'Ajustes']
  return (
    <View style={styles.nav} accessibilityLabel="bottom-navigation">
      {items.map((it) => (
        <TouchableOpacity key={it} style={styles.item}>
          <Text style={[styles.text, it === activeItem && styles.active]}>{it}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 56,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    color: '#6b7280',
  },
  active: {
    color: '#1e40af',
    fontWeight: '700',
  },
})
