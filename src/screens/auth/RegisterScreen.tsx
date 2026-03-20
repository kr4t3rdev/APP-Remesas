import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthWrapper } from '../../components/auth/AuthWrapper';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';
import api from '../../services/api';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const themeColors = useColors();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const styles = createStyles(themeColors);
  
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [btnHovered, setBtnHovered] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (nickname && nickname.length < 2) {
      newErrors.nickname = 'El nickname debe tener al menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password || password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula y número';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        email,
        password,
        name,
        nickname: nickname || undefined,
      });
      
      navigation.replace('VerificationPending', { email });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Desktop content
  const desktopContent = (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingVertical: spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <View style={[styles.header, !isDesktop && { marginBottom: spacing.lg }]}>
              {isDesktop ? (
                <>
                  <Text style={[styles.title, { color: themeColors.text.primary }]}>
                    Crear Cuenta
                  </Text>
                  <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
                    Regístrate para comenzar
                  </Text>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color={themeColors.primary[500]} />
                    <Text style={[styles.backButtonText, { color: themeColors.primary[500] }]}>
                      Volver
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: themeColors.text.primary }]}>
                      Crear Cuenta
                    </Text>
                    <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
                      Regístrate para comenzar
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Form Card */}
            <View style={[styles.formCard, { backgroundColor: themeColors.card }]}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text.secondary }]}>
                  Nombre completo
                </Text>
                <View style={[styles.inputWrapper, { borderColor: errors.name ? themeColors.danger : themeColors.border }]}>
                  <Ionicons name="person-outline" size={20} color={themeColors.text.tertiary} />
                  <Input
                    placeholder="Juan Pérez"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    containerStyle={styles.input}
                    style={styles.inputText}
                    error={errors.name}
                  />
                </View>
              </View>

              {/* Nickname Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text.secondary }]}>
                  Nickname (opcional)
                </Text>
                <View style={[styles.inputWrapper, { borderColor: errors.nickname ? themeColors.danger : themeColors.border }]}>
                  <Ionicons name="at-outline" size={20} color={themeColors.text.tertiary} />
                  <Input
                    placeholder="Juanito123"
                    value={nickname}
                    onChangeText={setNickname}
                    autoCapitalize="none"
                    autoCorrect={false}
                    containerStyle={styles.input}
                    style={styles.inputText}
                    error={errors.nickname}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text.secondary }]}>
                  Correo electrónico
                </Text>
                <View style={[styles.inputWrapper, { borderColor: errors.email ? themeColors.danger : themeColors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={themeColors.text.tertiary} />
                  <Input
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    containerStyle={styles.input}
                    style={styles.inputText}
                    error={errors.email}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text.secondary }]}>
                  Contraseña
                </Text>
                <View style={[styles.inputWrapper, { borderColor: errors.password ? themeColors.danger : themeColors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={themeColors.text.tertiary} />
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    containerStyle={styles.input}
                    style={styles.inputText}
                    error={errors.password}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={themeColors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.helperText, { color: themeColors.text.tertiary }]}>
                  Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número
                </Text>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.text.secondary }]}>
                  Confirmar contraseña
                </Text>
                <View style={[styles.inputWrapper, { borderColor: errors.confirmPassword ? themeColors.danger : themeColors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={themeColors.text.tertiary} />
                  <Input
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    containerStyle={styles.input}
                    style={styles.inputText}
                    error={errors.confirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={themeColors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    borderColor: acceptedTerms ? themeColors.primary[500] : themeColors.border,
                    backgroundColor: acceptedTerms ? themeColors.primary[500] + '20' : 'transparent',
                  }
                ]}>
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={16} color={themeColors.primary[500]} />
                  )}
                </View>
                <Text style={[styles.termsText, { color: themeColors.text.secondary }]}>
                  Acepto los términos y condiciones
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={[styles.errorText, { color: themeColors.danger }]}>
                  {errors.terms}
                </Text>
              )}

              {/* Register Button */}
              <Animated.View
                style={{
                  transform: [{ scale: btnScale }],
                  opacity: isDesktop ? (btnHovered ? 0.85 : 1) : 1,
                  marginTop: spacing.lg,
                }}
              >
                <TouchableOpacity
                  onPress={handleRegister}
                  onPressIn={() => {
                    if (!isDesktop) {
                      Animated.timing(btnScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
                    }
                  }}
                  onPressOut={() => {
                    if (!isDesktop) {
                      Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
                    }
                  }}
                  // @ts-ignore - web-only hover events
                  onMouseEnter={() => {
                    if (isDesktop) {
                      setBtnHovered(true);
                      Animated.spring(btnScale, { toValue: 1.02, useNativeDriver: true }).start();
                    }
                  }}
                  // @ts-ignore - web-only hover events
                  onMouseLeave={() => {
                    if (isDesktop) {
                      setBtnHovered(false);
                      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();
                    }
                  }}
                  disabled={loading}
                  style={[
                    styles.button,
                    { backgroundColor: themeColors.primary[500] },
                    loading && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Cargando...' : 'Crear Cuenta'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.text.secondary }]}>
                ¿Ya tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: themeColors.primary[500] }]}>
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );

  // Mobile return
  if (!isDesktop) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {desktopContent}
      </SafeAreaView>
    );
  }

  // Desktop return with AuthWrapper
  return (
    <AuthWrapper>
      {desktopContent}
    </AuthWrapper>
  );
};

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleContainer: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    marginTop: 0,
  },
  inputText: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  helperText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  termsText: {
    fontSize: 14,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
