import { useRef, useEffect, useState } from "react";
import { Animated } from "react-native";

interface UseRegisterAnimationsResult {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  btnScale: Animated.Value;
  btnHovered: boolean;
  setBtnHovered: (value: boolean) => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Custom hook to manage register screen animations
 * Handles: fade-in, slide-up, and button interactions
 * Decouples animation logic from component rendering
 */
export const useRegisterAnimations = (
  isDesktop: boolean
): UseRegisterAnimationsResult => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const [btnHovered, setBtnHovered] = useState(false);

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

  const onPressIn = () => {
    if (!isDesktop) {
      Animated.timing(btnScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const onPressOut = () => {
    if (!isDesktop) {
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const onMouseEnter = () => {
    if (isDesktop) {
      setBtnHovered(true);
      Animated.spring(btnScale, {
        toValue: 1.02,
        useNativeDriver: true,
      }).start();
    }
  };

  const onMouseLeave = () => {
    if (isDesktop) {
      setBtnHovered(false);
      Animated.spring(btnScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return {
    fadeAnim,
    slideAnim,
    btnScale,
    btnHovered,
    setBtnHovered,
    onPressIn,
    onPressOut,
    onMouseEnter,
    onMouseLeave,
  };
};
