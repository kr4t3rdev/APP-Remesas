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
import type { User } from '../../types';

const { width } = Dimensions.get('window');

type AdminSuspendSuccessModalProps = {
  visible: boolean;
  user: User | null;
  mode?: 'SUSPEND' | 'ACTIVATE';
  onGoToList: () => void;
  onGoToDashboard: () => void;
};

export const AdminSuspendSuccessModal: React.FC<AdminSuspendSuccessModalProps> = ({
  visible,
  user,
  mode = 'SUSPEND',
  onGoToList,
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
    danger: colors.danger,
    success: colors.success,
    border: colors.border,
    infoBg: colors.surface,
  };

  if (!visible || !user) return null;

  const isSuspend = mode === 'SUSPEND';
  const iconName = isSuspend ? 'person-remove-outline' : 'checkmark-circle-outline';
  const iconColor = isSuspend ? theme.primary : theme.success;
  const iconBg = isSuspend ? '#1E293B' : 'rgba(16, 185, 129, 0.1)';
  const checkBadgeColor = isSuspend ? theme.primary : theme.success;
  
  const title = isSuspend ? 'Cuenta Suspendida' : 'Cuenta Reactivada';
  const subtitle = isSuspend 
    ? (
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        La cuenta de <Text style={{ color: theme.text, fontWeight: '700' }}>{user.name}</Text> ha sido{'\n'}desactivada correctamente
      </Text>
    ) : (
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        La cuenta de <Text style={{ color: theme.text, fontWeight: '700' }}>{user.name}</Text> ha sido{'\n'}reactivada correctamente
      </Text>
    );

  const infoText = isSuspend
    ? "El usuario ya no tendrá acceso a la plataforma. Puedes revertir esta acción desde el panel de administración en cualquier momento."
    : "El usuario ahora tiene acceso completo a la plataforma y puede iniciar sesión inmediatamente.";

  const infoIcon = isSuspend ? 'information-circle' : 'checkmark-circle';
  const infoColor = isSuspend ? theme.primary : theme.success;
  const infoBorder = isSuspend ? theme.primary : theme.success;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoToList} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Confirmación</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Success Icon Group */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName} size={48} color={iconColor} />
            </View>
            <View style={[styles.checkBadge, { backgroundColor: checkBadgeColor, borderColor: theme.background }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>

          {/* Subtitle */}
          {subtitle}

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme.infoBg, borderColor: infoBorder }]}>
            <Ionicons name={infoIcon} size={24} color={infoColor} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {infoText}
            </Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={onGoToList}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Volver al Listado de Usuarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.card }]}
            onPress={onGoToDashboard}
            activeOpacity={0.8}
          >
            <Ionicons name="grid" size={20} color={theme.text} style={{ marginRight: 8 }} />
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Ir al Dashboard</Text>
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
  iconWrapper: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
