import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../theme';

export type ErrorModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  retryText?: string;
  cancelText?: string;
  onRetry?: () => void;
  onCancel: () => void;
};

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Error',
  message,
  retryText = 'Reintentar',
  cancelText = 'Cancelar',
  onRetry,
  onCancel,
}) => {
  const theme = {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    primary: '#3B82F6',
    danger: '#EF4444',
    border: '#334155',
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.danger }]}>
            <Ionicons name="alert-circle" size={48} color="#fff" />
          </View>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>
        </View>

        <View style={styles.footer}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>{retryText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.card }]}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>{cancelText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
    gap: spacing.md,
  },
  retryButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
