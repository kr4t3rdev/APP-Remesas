import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown } from '../animations';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { spacing, borderRadius } from '../../theme';
import { useColors, useShadows } from '../../store/themeStore';
import type { Worker, CreateWorkerInput, UpdateWorkerInput } from '../../types';

type WorkerFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkerInput | UpdateWorkerInput) => Promise<void>;
  worker?: Worker | null;
  isLoading?: boolean;
};

export const WorkerFormModal: React.FC<WorkerFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  worker,
  isLoading = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!worker;

  useEffect(() => {
    if (visible) {
      if (worker) {
        setName(worker.name);
        setPhone(worker.phone || '');
      } else {
        setName('');
        setPhone('');
      }
      setErrors({});
    }
  }, [visible, worker]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el trabajador. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FadeInDown>
          <View style={[styles.container, { backgroundColor: themeColors.card }, themeShadows.lg]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                {isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}
              </Text>
              <TouchableOpacity testID="close-worker-modal" onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Input
                testID="worker-name-input"
                label="Nombre"
                value={name}
                onChangeText={setName}
                placeholder="Ej: Juan Pérez"
                error={errors.name}
                autoCapitalize="words"
              />

              <Input
                testID="worker-phone-input"
                label="Teléfono (opcional)"
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej: 1234567890"
                keyboardType="phone-pad"
              />

              <View style={[styles.previewContainer, { backgroundColor: themeColors.background }]}>
                <Text style={[styles.previewLabel, { color: themeColors.text.secondary }]}>
                  Vista previa del icono
                </Text>
                <View style={[styles.previewAvatar, { backgroundColor: themeColors.primary[500] }]}>
                  <Text style={styles.previewInitials}>
                    {name.trim() ? name.trim().substring(0, 2).toUpperCase() + (name.split(' ')[1]?.substring(0, 1) || '') : '??'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                testID="worker-cancel-button"
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="worker-submit-button"
                title={isEditing ? 'Guardar' : 'Crear'}
                onPress={handleSubmit}
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </FadeInDown>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  previewContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInitials: {
    color: themeColors.text.inverse,
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
