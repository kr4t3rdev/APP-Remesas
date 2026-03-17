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

type AdminTempBlockModalProps = {
  visible: boolean;
  user: User | null;
  mode?: 'BLOCK' | 'UNBLOCK';
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export const AdminTempBlockModal: React.FC<AdminTempBlockModalProps> = ({
  visible,
  user,
  mode = 'BLOCK',
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
    warning: colors.warning,
    success: colors.success,
    border: colors.border,
  };

  if (!visible || !user) return null;

  const isBlock = mode === 'BLOCK';
  const mainColor = isBlock ? theme.warning : theme.success;
  const buttonColor = isBlock ? theme.danger : theme.success;
  const iconName = isBlock ? 'alert' : 'lock-open';
  const title = isBlock ? 'Bloqueo Temporal' : 'Desbloquear Usuario';
  const cardTitle = isBlock ? 'Advertencia de Bloqueo' : 'Confirmar Desbloqueo';
  const confirmText = isBlock ? 'Confirmar Bloqueo' : 'Confirmar Desbloqueo';
  
  const description = isBlock 
    ? (
      <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
        Al confirmar esta acción, el acceso del usuario será <Text style={{ color: theme.danger, fontWeight: '700' }}>restringido temporalmente</Text> de todas las funciones de la plataforma. Esta acción puede ser revertida por un administrador.
      </Text>
    ) : (
      <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
        Al confirmar esta acción, el usuario <Text style={{ color: theme.success, fontWeight: '700' }}>recuperará el acceso inmediato</Text> a todas las funciones de la plataforma.
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
          {/* Avatar with Badge */}
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: `${AVATAR_MOCK}?u=${user.id}` }} 
              style={styles.avatar} 
            />
            <View style={[styles.warningBadge, { backgroundColor: mainColor }]}>
              <Ionicons name={iconName} size={16} color="#fff" />
            </View>
          </View>

          {/* User Info */}
          <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.userId, { color: theme.textSecondary }]}>
            ID: {user.id} • {user.isActive ? 'USUARIO ACTIVO' : 'USUARIO INACTIVO'}
          </Text>

          {/* Warning/Info Card */}
          <View style={[styles.warningCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: isBlock ? 'rgba(255, 77, 79, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name={isBlock ? "alert-circle" : "information-circle"} size={32} color={isBlock ? theme.danger : theme.success} />
            </View>

            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {cardTitle}
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20, // Adjusted for modal presentation
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
    paddingTop: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
  },
  warningBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userId: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xl * 1.5,
  },
  warningCard: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
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
