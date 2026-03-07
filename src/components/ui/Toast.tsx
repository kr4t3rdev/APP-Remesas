import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, type Toast as ToastType } from '../../store/toastStore';
import { colors, spacing, borderRadius } from '../../theme';

const getBackgroundColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.danger;
    case 'warning':
      return '#F59E0B';
    case 'info':
    default:
      return colors.primary[500];
  }
};

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
};

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  return (
    <View style={[styles.toast, { backgroundColor: getBackgroundColor(toast.type) }]}>
      <Text style={styles.icon}>{getIcon(toast.type)}</Text>
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
    </View>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + spacing.md }]}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
