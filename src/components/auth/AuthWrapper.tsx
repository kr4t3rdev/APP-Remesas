import React, { useEffect, useRef } from "react";
import { View, StyleSheet, useWindowDimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandingPanel } from "./BrandingPanel";
import { AuthCard } from "./AuthCard";
import { useColors } from "../../store/themeStore";

const AUTH_BREAKPOINT = 768;

interface AuthWrapperProps {
  children: React.ReactNode;
  showBrandingPanel?: boolean;
  maxFormWidth?: number;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  showBrandingPanel = true,
  maxFormWidth = 420,
}) => {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isDesktop = width >= AUTH_BREAKPOINT;

  // Animation refs for fade in
  const brandingOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isDesktop) {
      // Animate branding panel
      Animated.timing(brandingOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Animate card with scale
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset for mobile
      brandingOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.95);
    }
  }, [isDesktop]);

  const styles = createStyles(colors);

  // Mobile layout
  if (!isDesktop) {
    return (
      <SafeAreaView style={styles.mobileContainer}>{children}</SafeAreaView>
    );
  }

  // Desktop split layout
  return (
    <View style={styles.desktopContainer}>
      {showBrandingPanel && (
        <Animated.View
          style={[styles.brandingPanelContainer, { opacity: brandingOpacity }]}
        >
          <BrandingPanel />
        </Animated.View>
      )}
      <View style={styles.formPanel}>
        <Animated.View
          style={[
            styles.authCardContainer,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
              maxWidth: maxFormWidth,
            },
          ]}
        >
          <AuthCard maxWidth={maxFormWidth}>{children}</AuthCard>
        </Animated.View>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    mobileContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    desktopContainer: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: colors.background,
      height: "100%",
      width: "100%",
      minHeight: "100%",
    },
    brandingPanelContainer: {
      flex: 0.4,
      minWidth: 300,
      height: "100%",
      width: "100%",
    },
    formPanel: {
      flex: 0.6,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      width: "100%",
    },
    authCardContainer: {
      width: "100%",
    },
  });

export default AuthWrapper;
