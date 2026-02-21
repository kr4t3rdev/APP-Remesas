import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, spacing, borderRadius } from '../../theme';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      await login(response.user, response.access_token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: spacing.lg,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: colors.text.primary,
                textAlign: 'center',
              }}
            >
              Casa de Cambio
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.text.secondary,
                textAlign: 'center',
                marginTop: spacing.sm,
              }}
            >
              Inicia sesión para continuar
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
            }}
          >
            <Input
              label="Correo electrónico"
              placeholder="admin@cambios.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <Text
                style={{
                  color: colors.danger,
                  fontSize: 14,
                  marginTop: spacing.sm,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            ) : null}

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
