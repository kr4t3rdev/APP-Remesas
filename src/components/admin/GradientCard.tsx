import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '../../store/themeStore'

type Props = {
  title: string
  subtitle?: string
  actionLabel?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  backgroundColor?: string
  onPress?: () => void
}

export const GradientCard: React.FC<Props> = ({ title, subtitle, actionLabel, icon, iconColor, backgroundColor, onPress }) => {
  const colors = useColors()
  const isDark = colors.background === '#0f172a'

  return (
    <View style={[styles.card, { backgroundColor: backgroundColor ?? (isDark ? '#1e293b' : '#e0f0ff') }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor ?? '#4f46e5' }]}>
        {icon && <Ionicons name={icon} size={24} color="#fff" />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#111827' }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#4b5563' }]}>{subtitle}</Text> : null}
        {actionLabel ? (
          <TouchableOpacity onPress={onPress} style={styles.actionButton}>
            <Text style={[styles.action, { color: iconColor ?? '#1e40af' }]}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={14} color={iconColor ?? '#1e40af'} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderRadius: 24,
    padding: 24,
    marginVertical: 8,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
})
