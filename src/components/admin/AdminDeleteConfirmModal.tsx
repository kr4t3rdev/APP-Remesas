import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { spacing } from '../../theme';

type AdminDeleteConfirmModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  userName?: string;
};

export const AdminDeleteConfirmModal: React.FC<AdminDeleteConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  loading = false,
  userName,
}) => {
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    danger: colors.danger,
    overlay: 'rgba(15, 23, 42, 0.75)',
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: theme.card }]}>
          
          <View style={[styles.iconContainer, { backgroundColor: `${theme.danger}20` }]}>
            <Ionicons name="trash" size={32} color={theme.danger} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            ¿Eliminar Usuario?
          </Text>
          
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Esta acción es irreversible. El usuario <Text style={{fontWeight: 'bold'}}>{userName}</Text> será eliminado permanentemente del sistema junto con todos sus datos asociados.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.confirmButton, 
                { backgroundColor: theme.danger, opacity: loading ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              disabled={loading}
              style={[styles.cancelButton, { borderColor: theme.textSecondary }]}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  confirmButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
