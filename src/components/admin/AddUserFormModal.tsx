import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { AdminCreateUserRequest, BillingCycle, UserRole } from '../../types';

type AddUserFormValues = AdminCreateUserRequest;

type AddUserFormModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (input: AddUserFormValues) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string;
  successMessage?: string;
};

const initialValues: AddUserFormValues = {
  name: '',
  email: '',
  role: 'USER',
  profile: {
    lastName: '',
    documentId: '',
  },
  contact: {
    phone: '',
  },
  access: {
    isActive: true,
    forcePasswordChangeOnFirstLogin: true,
    sendInviteEmail: true,
  },
  security: {
    riskLevel: 'LOW',
    notes: '',
  },
};

type ErrorState = {
  name?: string;
  email?: string;
  phone?: string;
};

const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
const isValidPhone = (value: string) => /^[0-9+()\-\s]{7,40}$/.test(value);
const toOptional = (value?: string) => {
  const trimmed = value?.trim() ?? '';
  return trimmed.length ? trimmed : undefined;
};

const compactPayload = (values: AddUserFormValues): AddUserFormValues => ({
  name: values.name.trim(),
  email: values.email.trim().toLowerCase(),
  role: values.role,
  profile: {
    lastName: toOptional(values.profile?.lastName),
    documentId: toOptional(values.profile?.documentId),
  },
  contact: {
    phone: toOptional(values.contact?.phone),
  },
  access: {
    isActive: values.access?.isActive ?? true,
    forcePasswordChangeOnFirstLogin: values.access?.forcePasswordChangeOnFirstLogin ?? true,
    sendInviteEmail: values.access?.sendInviteEmail ?? true,
  },
  security: {
    riskLevel: values.security?.riskLevel,
    notes: toOptional(values.security?.notes),
  },
});

const getSubmitFeedback = ({
  loading,
  errorMessage,
  successMessage,
}: {
  loading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}) => {
  if (loading) return { text: 'Procesando alta de usuario...', state: 'loading' as const };
  if (errorMessage) return { text: errorMessage, state: 'error' as const };
  if (successMessage) return { text: successMessage, state: 'success' as const };
  return null;
};

export const AddUserFormModal: React.FC<AddUserFormModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  errorMessage,
  successMessage,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const [values, setValues] = useState<AddUserFormValues>(initialValues);
  const [errors, setErrors] = useState<ErrorState>({});
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const submitFeedback = getSubmitFeedback({ loading, errorMessage, successMessage });

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotionEnabled(Boolean(enabled));
    });

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) => {
      setReduceMotionEnabled(Boolean(enabled));
    });

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    Animated.timing(feedbackOpacity, {
      toValue: submitFeedback ? 1 : 0,
      duration: reduceMotionEnabled ? 0 : 180,
      useNativeDriver: true,
    }).start();
  }, [feedbackOpacity, submitFeedback, reduceMotionEnabled]);

  const resetState = () => {
    setValues(initialValues);
    setErrors({});
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const validate = () => {
    const nextErrors: ErrorState = {};

    const name = values.name.trim();
    const email = values.email.trim().toLowerCase();
    const phone = values.contact?.phone?.trim() ?? '';

    if (!name) nextErrors.name = 'El nombre es obligatorio';
    if (!email) nextErrors.email = 'El email es obligatorio';
    else if (!isValidEmail(email)) nextErrors.email = 'Formato de email inválido';

    if (phone && !isValidPhone(phone)) {
      nextErrors.phone = 'Formato de teléfono inválido';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(compactPayload(values));
  };

  const feedbackStyle =
    submitFeedback?.state === 'error'
      ? styles.feedbackError
      : submitFeedback?.state === 'success'
      ? styles.feedbackSuccess
      : styles.feedbackLoading;

  const toggleBoolean = (path: 'isActive' | 'forcePasswordChangeOnFirstLogin' | 'sendInviteEmail') => {
    setValues((prev) => ({
      ...prev,
      access: {
        ...prev.access,
        [path]: !(prev.access?.[path] ?? false),
      },
    }));
  };

  const setRole = (role: UserRole) => setValues((prev) => ({ ...prev, role }));
  const setRisk = (riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') =>
    setValues((prev) => ({ ...prev, security: { ...prev.security, riskLevel } }));
  const setCycle = (cycle: BillingCycle) =>
    setValues((prev) => ({ ...prev, licenseSetup: { ...prev.licenseSetup, cycle } }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Add user (CRUD)</Text>
          <Text style={styles.subtitle}>Formulario extendido en un solo flujo. Required(*) y opcionales visibles.</Text>

          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formScrollContent}>
            <Section title="Identidad (required + perfil)">
              <Input
                testID="add-user-name-input"
                label="Nombre *"
                value={values.name}
                onChangeText={(name) => {
                  setValues((prev) => ({ ...prev, name }));
                  if (errors.name && name.trim()) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={errors.name}
              />
              <Input
                testID="add-user-email-input"
                label="Email *"
                value={values.email}
                onChangeText={(email) => {
                  setValues((prev) => ({ ...prev, email }));
                  if (errors.email && email.trim()) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                containerStyle={styles.mtSm}
              />
              <Input
                testID="add-user-last-name-input"
                label="Apellido (opcional)"
                value={values.profile?.lastName ?? ''}
                onChangeText={(lastName) =>
                  setValues((prev) => ({ ...prev, profile: { ...prev.profile, lastName } }))
                }
                containerStyle={styles.mtSm}
              />
              <Input
                testID="add-user-document-id-input"
                label="Documento ID (opcional)"
                value={values.profile?.documentId ?? ''}
                onChangeText={(documentId) =>
                  setValues((prev) => ({ ...prev, profile: { ...prev.profile, documentId } }))
                }
                containerStyle={styles.mtSm}
              />
            </Section>

            <Section title="Contacto">
              <Input
                testID="add-user-phone-input"
                label="Teléfono"
                value={values.contact?.phone ?? ''}
                onChangeText={(phone) => {
                  setValues((prev) => ({ ...prev, contact: { ...prev.contact, phone } }));
                  if (errors.phone && isValidPhone(phone.trim())) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </Section>

            <Section title="Acceso y seguridad inicial">
              <RoleSelector role={values.role} onChange={setRole} />
              <BooleanRow
                testID="add-user-is-active-toggle"
                label="Cuenta activa al crear"
                value={values.access?.isActive ?? true}
                onToggle={() => toggleBoolean('isActive')}
              />
              <BooleanRow
                testID="add-user-force-password-toggle"
                label="Forzar cambio de contraseña al primer login"
                value={values.access?.forcePasswordChangeOnFirstLogin ?? true}
                onToggle={() => toggleBoolean('forcePasswordChangeOnFirstLogin')}
              />
              <BooleanRow
                testID="add-user-send-invite-toggle"
                label="Enviar invitación por email"
                value={values.access?.sendInviteEmail ?? true}
                onToggle={() => toggleBoolean('sendInviteEmail')}
              />
              <Text style={styles.fieldLabel}>Riesgo inicial</Text>
              <View style={styles.pillRow}>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((riskLevel) => (
                  <Pill
                    key={riskLevel}
                    testID={`add-user-risk-${riskLevel}`}
                    active={values.security?.riskLevel === riskLevel}
                    label={riskLevel}
                    onPress={() => setRisk(riskLevel)}
                  />
                ))}
              </View>
              <Input
                testID="add-user-security-notes-input"
                label="Notas de seguridad"
                value={values.security?.notes ?? ''}
                onChangeText={(notes) => setValues((prev) => ({ ...prev, security: { ...prev.security, notes } }))}
                multiline
                numberOfLines={3}
                containerStyle={styles.mtSm}
              />
            </Section>
          </ScrollView>

          <Animated.View style={[styles.feedbackWrapper, feedbackStyle, { opacity: feedbackOpacity }]}>
            <Text testID="add-user-submit-feedback" style={styles.feedbackText}>
              {submitFeedback?.text ?? ''}
            </Text>
          </Animated.View>

          <View style={styles.actions}>
            <TouchableOpacity
              testID="add-user-cancel-button"
              accessibilityRole="button"
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <Button
              testID="add-user-submit-button"
              title={loading ? 'Creando...' : 'Crear usuario'}
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const colors = useColors();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.text.primary, fontWeight: '700', marginBottom: spacing.sm }}>{title}</Text>
      {children}
    </View>
  );
};

const BooleanRow: React.FC<{ testID: string; label: string; value: boolean; onToggle: () => void }> = ({
  testID,
  label,
  value,
  onToggle,
}) => {
  const colors = useColors();

  return (
    <View style={stylesShared.booleanRow}>
      <Text style={{ color: colors.text.secondary, flex: 1 }}>{label}</Text>
      <TouchableOpacity
        testID={testID}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onPress={onToggle}
        style={[
          stylesShared.booleanToggle,
          {
            borderColor: value ? colors.success : colors.border,
            backgroundColor: value ? `${colors.success}20` : colors.background,
          },
        ]}
      >
        <Text style={{ color: colors.text.primary, fontWeight: '700' }}>{value ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const RoleSelector: React.FC<{ role: UserRole; onChange: (role: UserRole) => void }> = ({ role, onChange }) => {
  const colors = useColors();

  return (
    <View>
      <Text style={stylesShared.fieldLabel}>Rol *</Text>
      <View style={stylesShared.pillRow}>
        {(['USER', 'ADMIN'] as UserRole[]).map((value) => {
          const active = role === value;
          return (
            <TouchableOpacity
              key={value}
              testID={`add-user-role-${value}`}
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar rol ${value}`}
              onPress={() => onChange(value)}
              style={[
                stylesShared.rolePill,
                {
                  borderColor: active ? colors.primary[500] : colors.border,
                  backgroundColor: active ? `${colors.primary[500]}16` : colors.background,
                },
              ]}
            >
              <Text style={{ color: active ? colors.primary[500] : colors.text.secondary, fontWeight: '600' }}>{value}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const Pill: React.FC<{ testID: string; active: boolean; label: string; onPress: () => void }> = ({
  testID,
  active,
  label,
  onPress,
}) => {
  const colors = useColors();

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        stylesShared.rolePill,
        {
          borderColor: active ? colors.primary[500] : colors.border,
          backgroundColor: active ? `${colors.primary[500]}16` : colors.background,
        },
      ]}
    >
      <Text style={{ color: active ? colors.primary[500] : colors.text.secondary, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const stylesShared = StyleSheet.create({
  fieldLabel: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rolePill: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  booleanRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  booleanToggle: {
    minHeight: 44,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
});

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
      maxHeight: '92%',
      ...shadows.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    formScroll: {
      maxHeight: 520,
    },
    formScrollContent: {
      paddingBottom: spacing.sm,
    },
    mtSm: {
      marginTop: spacing.sm,
    },
    inlineRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    inlineField: {
      flex: 1,
    },
    fieldLabel: {
      color: colors.text.primary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    feedbackWrapper: {
      minHeight: 18,
      marginTop: spacing.xs,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      justifyContent: 'center',
    },
    feedbackLoading: {
      backgroundColor: `${colors.primary[500]}20`,
    },
    feedbackError: {
      backgroundColor: `${colors.danger}20`,
    },
    feedbackSuccess: {
      backgroundColor: `${colors.success}20`,
    },
    feedbackText: {
      color: colors.text.primary,
      fontSize: 12,
      fontWeight: '600',
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
  });
