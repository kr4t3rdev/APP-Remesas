import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { User } from '../../types';

// Mock avatar for consistency
const AVATAR_MOCK = 'https://i.pravatar.cc/150';
const { width } = Dimensions.get('window');

type AdminSuspendAccountModalProps = {
  visible: boolean;
  user: User | null;
  mode?: 'SUSPEND' | 'ACTIVATE';
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export const AdminSuspendAccountModal: React.FC<AdminSuspendAccountModalProps> = ({
  visible,
  user,
  mode = 'SUSPEND',
  onClose,
  onConfirm,
  loading = false,
}) => {
  // Theme
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    danger: colors.danger,
    success: colors.success,
    border: colors.border,
  };

  if (!visible || !user) return null;

  const isSuspend = mode === 'SUSPEND';
  const mainColor = isSuspend ? theme.danger : theme.success;
  const buttonColor = isSuspend ? theme.danger : theme.success;
  const title = isSuspend ? 'Suspender Cuenta' : 'Reactivar Cuenta';
  const confirmText = isSuspend ? 'Confirmar Suspensión' : 'Confirmar Reactivación';
  const warningTitle = isSuspend ? '¿Estás seguro?' : 'Confirmar Reactivación';
  
  const description = isSuspend 
    ? (
      <Text style={[styles.warningDescription, { color: theme.textSecondary }]}>
        Al confirmar esta acción, el usuario perderá el acceso de forma permanente a todas sus funciones y se cerrarán todas sus sesiones activas.
      </Text>
    ) : (
      <Text style={[styles.warningDescription, { color: theme.textSecondary }]}>
        Al confirmar esta acción, el usuario <Text style={{ color: theme.success, fontWeight: '700' }}>recuperará el acceso completo</Text> a la plataforma inmediatamente.
      </Text>
    );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Avatar with Glow Effect */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarGlow, { backgroundColor: isSuspend ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]} />
            <Image 
              source={{ uri: `${AVATAR_MOCK}?u=${user.id}` }} 
              style={styles.avatar} 
            />
          </View>

          {/* User Info */}
          <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.userHandle, { color: theme.textSecondary }]}>
            @{user.email.split('@')[0]}
          </Text>

          {/* Warning Message */}
          <View style={styles.warningContainer}>
            <Text style={[styles.warningTitle, { color: theme.text }]}>
              {warningTitle}
            </Text>

            {description}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton, 
              { 
                backgroundColor: buttonColor,
                shadowColor: buttonColor,
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? 'Procesando...' : confirmText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.card }]}
            onPress={onClose}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancelar</Text>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: spacing.md,
  },
  backButton: {
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#334155',
    borderWidth: 4,
    borderColor: '#0F172A',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    marginBottom: spacing.xl * 2,
  },
  warningContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  warningDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
    gap: spacing.md,
  },
  confirmButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
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
