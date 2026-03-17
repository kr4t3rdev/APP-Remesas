import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { User, UserRole } from '../../types';

const { width } = Dimensions.get('window');

type AdminRoleChangeSuccessModalProps = {
  visible: boolean;
  user: User | null;
  newRole: string; // Display label (e.g. "Administrador Senior")
  onBackToProfile: () => void;
  onGoToDashboard: () => void;
};

export const AdminRoleChangeSuccessModal: React.FC<AdminRoleChangeSuccessModalProps> = ({
  visible,
  user,
  newRole,
  onBackToProfile,
  onGoToDashboard,
}) => {
  // Theme
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    success: colors.success,
    border: colors.border,
  };

  if (!visible || !user) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackToProfile} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Confirmación</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Success Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.success }]}>
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            Rol Actualizado con{'\n'}Éxito
          </Text>

          {/* Details Card */}
          <View style={[styles.detailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.detailsText, { color: theme.textSecondary }]}>
              El usuario <Text style={{ color: theme.text, fontWeight: '700' }}>{user.name}</Text> ahora tiene el rol de <Text style={{ color: theme.primary, fontWeight: '700' }}>{newRole}</Text>
            </Text>
          </View>

          {/* Decorative Security Shield */}
          <View style={[styles.decorativeCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="shield-checkmark" size={64} color={colors.text.tertiary} />
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={onBackToProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Volver al Perfil</Text>
            <Ionicons name="person" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.card }]}
            onPress={onGoToDashboard}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Ir al Panel de Usuarios</Text>
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
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 34,
  },
  detailsCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  detailsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  decorativeCard: {
    width: '100%',
    height: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
