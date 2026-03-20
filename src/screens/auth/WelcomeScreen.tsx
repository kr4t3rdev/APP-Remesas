import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthWrapper } from '../../components/auth/AuthWrapper';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';

interface WelcomeScreenProps {
  navigation: any;
}

const getFeatures = (colors: any) => [
  { icon: 'swap-horizontal', color: colors.primary[500], text: 'Cambio de divisas' },
  { icon: 'receipt', color: colors.secondary[500], text: 'Control de transacciones' },
  { icon: 'wallet', color: colors.accent[500], text: 'Gestión de efectivo' },
  { icon: 'bar-chart', color: colors.info, text: 'Reportes detallados' },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const themeColors = useColors();
  const styles = createStyles(themeColors);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const FEATURES = getFeatures(themeColors);
  
  const logoAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDesktop) {
      logoAnim.setValue(1);
      taglineAnim.setValue(1);
      featuresAnim.setValue(1);
      buttonsAnim.setValue(1);
    } else {
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(taglineAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(featuresAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(buttonsAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDesktop]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const logoOpacity = logoAnim;

  const content = (
    <View style={styles.heroContent}>
      <Animated.View style={[
        styles.logoContainer,
        { 
          opacity: logoOpacity, 
          transform: [{ scale: logoScale }] 
        }
      ]}>
        <View style={styles.logoIconContainer}>
          <Ionicons name="cash" size={64} color={themeColors.text.inverse} />
        </View>
        <Text style={styles.logoText}>XChange$ocial</Text>
      </Animated.View>
      
      <Animated.Text style={[
        styles.tagline,
        { opacity: taglineAnim }
      ]}>
        Tu gestor de finanzas personales
      </Animated.Text>
    </View>
  );

  const featuresSection = (
    <Animated.View style={[
      styles.contentSection,
      { opacity: featuresAnim }
    ]}>
      <View style={styles.featuresContainer}>
        {FEATURES.map((feature, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.featureItem,
              {
                opacity: featuresAnim,
                transform: [{
                  translateX: featuresAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                }],
              },
            ]}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon as any} size={22} color={feature.color} />
            </View>
            <Text style={[styles.featureText, { color: themeColors.text.secondary }]}>
              {feature.text}
            </Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const buttonsSection = (
    <Animated.View style={[
      styles.buttonsSection,
      { 
        opacity: buttonsAnim,
        transform: [{
          translateY: buttonsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        }],
      }
    ]}>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: themeColors.primary[500] }]}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Ionicons name="log-in" size={22} color={themeColors.text.inverse} />
        <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: themeColors.primary[500] }]}
        onPress={() => navigation.navigate('Register')}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={22} color={themeColors.primary[500]} />
        <Text style={[styles.secondaryButtonText, { color: themeColors.primary[500] }]}>
          Registrarse
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const footer = (
    <Text style={[styles.footerText, { color: themeColors.text.tertiary }]}>
      © 2026 XChange$ocial
    </Text>
  );

  if (isDesktop) {
    return (
      <AuthWrapper showBrandingPanel={false}>
        <View style={styles.desktopContainer}>
          <View style={styles.desktopHero}>
            {content}
          </View>
          <View style={styles.desktopContent}>
            {featuresSection}
            {buttonsSection}
            {footer}
          </View>
        </View>
      </AuthWrapper>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, height: '100vh' }]}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={[themeColors.primary[500], themeColors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <SafeAreaView style={styles.heroWrapper}>
          {content}
        </SafeAreaView>
      </LinearGradient>

      {featuresSection}

      {buttonsSection}

      {footer}
    </View>
  );
};

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    height: '100%',
    width: '100%',
  },
  heroSection: {
    height: '40%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: themeColors.text.inverse,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  buttonsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    shadowColor: themeColors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: themeColors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: spacing.lg,
  },
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    minHeight: '100vh',
  },
  desktopHero: {
    flex: 0.4,
    backgroundColor: themeColors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    height: '100%',
  },
  desktopContent: {
    flex: 0.6,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    height: '100%',
  },
});

export default WelcomeScreen;
