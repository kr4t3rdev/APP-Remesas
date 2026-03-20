import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthWrapper } from '../../components/auth/AuthWrapper';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';
import api from '../../services/api';

interface VerificationPendingScreenProps {
  navigation: any;
  route: any;
}

const WHATSAPP_NUMBER = '5353917705';

export const VerificationPendingScreen: React.FC<VerificationPendingScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { email } = route.params || {};
  const themeColors = useColors();
  const styles = createStyles(themeColors);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!isDesktop) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      Alert.alert('Éxito', 'Te enviamos un nuevo email de verificación.');
      setCooldown(60);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al re-enviar email';
      Alert.alert('Error', errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleWhatsApp = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
      }
    });
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const content = (
    <Animated.View 
      style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[themeColors.primary[500], themeColors.primary[700]]}
          style={styles.iconGradient}
        >
          <Ionicons name="mail" size={48} color={themeColors.text.inverse} />
        </LinearGradient>
      </View>

      <Text style={[styles.title, { color: themeColors.text.primary }]}>
        ¡Registro exitoso!
      </Text>
      
      <Text style={[styles.message, { color: themeColors.text.secondary }]}>
        Te enviamos un email a{' '}
        <Text style={{ fontWeight: '600', color: themeColors.primary[600] }}>
          {email}
        </Text>
      </Text>

      <View style={[styles.infoCard, { backgroundColor: themeColors.primary[50] }]}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color={themeColors.primary[600]} />
          <Text style={[styles.infoText, { color: themeColors.primary[700] }]}>
            Tu cuenta está pendiente de activación
          </Text>
        </View>
        <Text style={[styles.infoSubtext, { color: themeColors.primary[600] }]}>
          Para activar tu cuenta, contacta con el administrador a través de WhatsApp para realizar el pago.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleWhatsApp}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#25D366', '#128C7E']}
          style={styles.whatsappGradient}
        >
          <Ionicons name="logo-whatsapp" size={24} color={themeColors.text.inverse} />
          <Text style={styles.whatsappText}>Contactar por WhatsApp</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.contactInfo}>
        <Ionicons name="call-outline" size={18} color={themeColors.text.tertiary} />
        <Text style={[styles.contactText, { color: themeColors.text.tertiary }]}>
          +53 {WHATSAPP_NUMBER}
        </Text>
      </View>

      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { color: themeColors.text.secondary }]}>
          ¿No recibiste el email?
        </Text>
        <TouchableOpacity
          onPress={handleResendEmail}
          disabled={cooldown > 0 || resending}
        >
          <Text style={[
            styles.resendButton,
            { color: cooldown > 0 ? themeColors.text.tertiary : themeColors.primary[500] }
          ]}>
            {cooldown > 0 
              ? `Re-enviar (${cooldown}s)` 
              : resending 
                ? 'Enviando...' 
                : 'Re-enviar email'
            }
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={themeColors.text.tertiary} />
        <Text style={[styles.logoutText, { color: themeColors.text.tertiary }]}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (isDesktop) {
    return (
      <AuthWrapper>
        <Text style={[styles.desktopTitle, { color: themeColors.text.primary }]}>
          Verificación pendiente
        </Text>
        <Text style={[styles.desktopSubtitle, { color: themeColors.text.secondary }]}>
          Tu cuenta está esperando activación
        </Text>
        {content}
      </AuthWrapper>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {content}
    </SafeAreaView>
  );
};

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: themeColors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  desktopTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  desktopSubtitle: {
    fontSize: 16,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: spacing.lg + spacing.sm,
  },
  whatsappButton: {
    width: '100%',
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  whatsappGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: spacing.sm,
  },
  whatsappText: {
    color: themeColors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  contactText: {
    fontSize: 14,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  logoutText: {
    fontSize: 14,
  },
});

export default VerificationPendingScreen;
