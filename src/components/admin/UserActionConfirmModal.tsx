import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FadeInDown } from '../animations';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

type UserActionConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
};

export const UserActionConfirmModal: React.FC<UserActionConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar acción',
  onCancel,
  onConfirm,
  loading = false,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const handleCancel = () => {
    setReason('');
    setReasonError(undefined);
    onCancel();
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError('El motivo es obligatorio para esta acción');
      return;
    }

    setReasonError(undefined);
    onConfirm(trimmed);
    setReason('');
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <FadeInDown duration={180}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <Input
              testID="user-action-reason-input"
              label="Motivo"
              placeholder="Describe por qué ejecutas esta acción"
              value={reason}
              onChangeText={(value) => {
                setReason(value);
                if (reasonError && value.trim()) setReasonError(undefined);
              }}
              error={reasonError}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                testID="user-action-cancel-button"
                accessibilityRole="button"
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <Button
                title={confirmLabel}
                onPress={handleConfirm}
                loading={loading}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </FadeInDown>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    dialog: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    message: {
      color: colors.text.secondary,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    actions: {
      marginTop: spacing.md,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cancelButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    cancelText: {
      color: colors.text.secondary,
      fontWeight: '600',
    },
    confirmButton: {
      minHeight: 44,
    },
  });
