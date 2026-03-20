import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';
import { resetPassword } from '../../services/passwordRecovery';

interface ResetPasswordScreenProps {
  navigation: any;
  route: any;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const themeColors = useColors();
  const styles = createStyles(themeColors);
  const initialToken = route?.params?.token ?? '';
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validationError = useMemo(() => {
    if (!token.trim()) return 'Ingresa el token de recuperación';
    if (newPassword.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return 'La contraseña debe contener mayúscula, minúscula y número';
    }
    if (newPassword !== confirmPassword) return 'Las contraseñas no coinciden';
    return '';
  }, [token, newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await resetPassword(token.trim(), newPassword);
      setSuccess(response.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No pudimos restablecer tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={themeColors.primary[500]} />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={42} color={themeColors.primary[500]} />
            </View>
            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa el token recibido por email y define tu nueva contraseña.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Token</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="ticket-outline" size={20} color={themeColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Pega aquí tu token"
                placeholderTextColor={themeColors.text.tertiary}
                value={token}
                onChangeText={(text) => {
                  setToken(text);
                  if (error) setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={themeColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                placeholderTextColor={themeColors.text.tertiary}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={themeColors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color={themeColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirma la contraseña"
                placeholderTextColor={themeColors.text.tertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={themeColors.text.tertiary}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={themeColors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={themeColors.secondary[600]} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <Button title="Restablecer contraseña" onPress={handleSubmit} loading={loading} disabled={loading} />

            {success ? (
              <Button
                title="Ir a iniciar sesión"
                variant="outline"
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (themeColors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: themeColors.background, minHeight: '100vh', width: '100%' },
  content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.xs },
  backButtonText: { color: themeColors.primary[500], fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  iconContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: themeColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: '700', color: themeColors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: themeColors.text.secondary, textAlign: 'center' },
  card: {
    backgroundColor: themeColors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  label: { fontSize: 14, fontWeight: '500', color: themeColors.text.secondary },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: themeColors.background,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: themeColors.text.primary },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: themeColors.danger + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: { color: themeColors.danger, flex: 1, fontWeight: '500' },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: themeColors.secondary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  successText: { color: themeColors.secondary[700], flex: 1, fontWeight: '500' },
});
