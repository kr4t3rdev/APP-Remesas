import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import { ErrorModal } from '../../components/admin/ErrorModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const { changePassword, mustChangePassword } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    danger: colors.danger,
    border: colors.border,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.lg,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${theme.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    form: {
      gap: spacing.md,
    },
    inputContainer: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: borderRadius.lg,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    requirements: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    requirementsTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: spacing.sm,
    },
    requirement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    requirementText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: spacing.xs,
    },
    requirementMet: {
      color: theme.primary,
    },
  });

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const isValid = validatePassword(newPassword) && passwordsMatch;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Si es cambio forzado, no necesita contraseña actual
      await changePassword(undefined, newPassword);
      // Navegar al home después de cambiar
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      setErrorModal({
        visible: true,
        message: error.response?.data?.message || 'Error al cambiar la contraseña',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={colors.background === '#0F172A' ? "light-content" : "dark-content"} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={40} color={theme.primary} />
            </View>
            <Text style={styles.title}>
              {mustChangePassword ? 'Cambio de Contraseña Requerido' : 'Cambiar Contraseña'}
            </Text>
            <Text style={styles.subtitle}>
              {mustChangePassword 
                ? 'Debes cambiar tu contraseña antes de continuar usando la aplicación.'
                : 'Ingresa tu nueva contraseña a continuación.'
              }
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                placeholderTextColor={theme.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
              <View style={styles.requirement}>
                <Ionicons 
                  name={newPassword.length >= 6 ? 'checkmark-circle' : 'close-circle'} 
                  size={14} 
                  color={newPassword.length >= 6 ? theme.primary : theme.textSecondary} 
                />
                <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementMet]}>
                  Mínimo 6 caracteres
                </Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons 
                  name={passwordsMatch ? 'checkmark-circle' : 'close-circle'} 
                  size={14} 
                  color={passwordsMatch ? theme.primary : theme.textSecondary} 
                />
                <Text style={[styles.requirementText, passwordsMatch && styles.requirementMet]}>
                  Las contraseñas coinciden
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorModal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        onCancel={() => setErrorModal({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
};
