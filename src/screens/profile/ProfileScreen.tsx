import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
};

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'password',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualizar contraseña de acceso',
      icon: '🔒',
      onPress: () => setShowPasswordForm(!showPasswordForm),
    },
    {
      id: 'rates',
      title: 'Tasas de Cambio',
      subtitle: 'Configurar tasas de referencia',
      icon: '💱',
      onPress: () => Alert.alert('Navegar a Tasas'),
    },
    {
      id: 'accounts',
      title: 'Cuentas Bancarias',
      subtitle: 'Gestionar cuentas',
      icon: '🏦',
      onPress: () => Alert.alert('Navegar a Cuentas'),
    },
    {
      id: 'about',
      title: 'Acerca de',
      subtitle: 'Versión 1.0.0',
      icon: 'ℹ️',
      onPress: () => Alert.alert('Casa de Cambio', 'Versión 1.0.0\nSistema de gestión para casa de cambio'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            alignItems: 'center',
            ...shadows.md,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary[100],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
            {user?.name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
            {user?.email}
          </Text>
        </View>

        {showPasswordForm && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginTop: spacing.md,
              ...shadows.sm,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md }}>
              Cambiar Contraseña
            </Text>
            <Input
              label="Contraseña Actual"
              placeholder="••••••••"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <View style={{ marginTop: spacing.sm }}>
              <Input
                label="Nueva Contraseña"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Guardar"
                onPress={handleChangePassword}
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        <View style={{ marginTop: spacing.md }}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              style={{
                backgroundColor: colors.card,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.sm,
                ...shadows.sm,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.primary }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.text.secondary }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          style={{ marginTop: spacing.lg }}
          textStyle={{ color: colors.danger }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
