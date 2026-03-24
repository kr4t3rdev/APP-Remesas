import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import { FadeIn, ScaleIn } from '../animations';
import { Button } from './Button';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  onConfirm,
  onCancel,
  iconName,
}) => {
  const themeColors = useColors();

  const getVariantColor = () => {
    switch (variant) {
      case 'danger':
        return themeColors.danger;
      case 'warning':
        return themeColors.warning;
      case 'primary':
      default:
        return themeColors.primary[500];
    }
  };

  const getIconForVariant = (): keyof typeof Ionicons.glyphMap => {
    if (iconName) return iconName;
    switch (variant) {
      case 'danger':
        return 'warning-outline';
      case 'warning':
        return 'alert-circle-outline';
      case 'primary':
      default:
        return 'information-circle-outline';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        
        <ScaleIn duration={200} style={styles.modalContainer}>
          <View
            style={[
              styles.content,
              { backgroundColor: themeColors.card },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${getVariantColor()}15` }]}>
              <Ionicons
                name={getIconForVariant()}
                size={32}
                color={getVariantColor()}
              />
            </View>

            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              {title}
            </Text>
            
            <Text style={[styles.message, { color: themeColors.text.secondary }]}>
              {message}
            </Text>

            <View style={styles.actions}>
              <Button
                title={cancelText}
                onPress={onCancel}
                variant="outline"
                style={styles.button}
              />
              <Button
                title={confirmText}
                onPress={onConfirm}
                variant={variant === 'danger' ? 'danger' : 'primary'}
                style={styles.button}
              />
            </View>
          </View>
        </ScaleIn>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  content: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
