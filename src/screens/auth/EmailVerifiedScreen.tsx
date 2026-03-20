import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';

interface EmailVerifiedScreenProps {
  navigation: any;
}

export const EmailVerifiedScreen: React.FC<EmailVerifiedScreenProps> = ({ navigation }) => {
  const themeColors = useColors();
  const styles = createStyles(themeColors);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleGoToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={[themeColors.secondary[500], themeColors.secondary[600]]}
            style={styles.iconContainer}
          >
            <Ionicons name="checkmark-circle" size={56} color={themeColors.text.inverse} />
          </LinearGradient>
        </Animated.View>

        {/* Title and Message */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>
            ¡Email verificado!
          </Text>
          
          <Text style={[styles.message, { color: themeColors.text.secondary }]}>
            Tu correo electrónico ha sido verificado correctamente.
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: themeColors.secondary[50] }]}>
            <Ionicons name="information-circle" size={20} color={themeColors.secondary[600]} />
            <Text style={[styles.infoText, { color: themeColors.secondary[700] }]}>
              Ahora puedes iniciar sesión con tus credenciales.
            </Text>
          </View>
        </Animated.View>

        {/* Go to Login Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <Button
            title="Ir a Iniciar Sesión"
            onPress={handleGoToLogin}
            style={styles.button}
          />
        </Animated.View>
      </View>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: themeColors.secondary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.xl,
  },
  button: {
    marginTop: spacing.md,
  },
});
