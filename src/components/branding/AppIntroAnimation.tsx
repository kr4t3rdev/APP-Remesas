import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { useColors } from "../../store/themeStore";
import { AppLogo } from "./AppLogo";

interface AppIntroAnimationProps {
  onComplete: () => void;
  reducedMotionOverride?: boolean;
}

export const APP_INTRO_MOTION_PROFILE = {
  duration: 1180,
  fadeOutDuration: 180,
  orbitDegrees: 720,
  logoRotationDegrees: 32,
  logoScale: [0.68, 1] as const,
} as const;

const REDUCED_REVEAL_DURATION = 100;
const REDUCED_FADE_DURATION = 80;
const REDUCE_MOTION_LOOKUP_TIMEOUT = 150;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export function AppIntroAnimation({
  onComplete,
  reducedMotionOverride,
}: AppIntroAnimationProps) {
  const colors = useColors();
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(
    reducedMotionOverride ?? null,
  );
  const motion = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotionOverride !== undefined) {
      setReduceMotion(reducedMotionOverride);
      return;
    }

    let mounted = true;
    const fallbackTimer = setTimeout(() => {
      if (mounted) setReduceMotion(false);
    }, REDUCE_MOTION_LOOKUP_TIMEOUT);
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        clearTimeout(fallbackTimer);
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        if (mounted) setReduceMotion(false);
      });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.remove();
    };
  }, [reducedMotionOverride]);

  useEffect(() => {
    if (reduceMotion === null) return;

    motion.setValue(0);
    overlayOpacity.setValue(1);
    const revealDuration = reduceMotion
      ? REDUCED_REVEAL_DURATION
      : APP_INTRO_MOTION_PROFILE.duration;
    const fadeDuration = reduceMotion
      ? REDUCED_FADE_DURATION
      : APP_INTRO_MOTION_PROFILE.fadeOutDuration;

    const animation = Animated.sequence([
      Animated.timing(motion, {
        toValue: 1,
        duration: revealDuration,
        easing: reduceMotion ? Easing.out(Easing.quad) : EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: fadeDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onComplete();
    });

    return () => animation.stop();
  }, [motion, onComplete, overlayOpacity, reduceMotion]);

  const logoStyle = useMemo(
    () =>
      reduceMotion
        ? { opacity: motion }
        : {
            opacity: motion.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0, 1, 1],
            }),
            transform: [
              {
                rotate: motion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    `-${APP_INTRO_MOTION_PROFILE.logoRotationDegrees}deg`,
                    "0deg",
                  ],
                }),
              },
              {
                scale: motion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [...APP_INTRO_MOTION_PROFILE.logoScale],
                }),
              },
            ],
          },
    [motion, reduceMotion],
  );

  const orbitStyle = {
    opacity: reduceMotion ? 0 : motion,
    transform: [
      {
        rotate: motion.interpolate({
          inputRange: [0, 1],
          outputRange: [
            "-180deg",
            `${APP_INTRO_MOTION_PROFILE.orbitDegrees - 180}deg`,
          ],
        }),
      },
    ],
  };

  const haloStyle = {
    opacity: reduceMotion
      ? 0
      : motion.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [0, 0.3, 0.12],
        }),
    transform: [
      {
        scale: motion.interpolate({
          inputRange: [0, 1],
          outputRange: [0.72, 1.08],
        }),
      },
    ],
  };

  return (
    <Animated.View
      testID="app-intro-overlay"
      accessibilityViewIsModal
      importantForAccessibility="yes"
      style={[
        styles.overlay,
        { backgroundColor: colors.background, opacity: overlayOpacity },
      ]}
    >
      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.halo,
            {
              borderColor: colors.primary[300],
              backgroundColor: colors.primary[50],
            },
            haloStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.orbitTrack,
            { borderColor: colors.primary[300] },
            orbitStyle,
          ]}
        >
          <View
            style={[
              styles.orbitDot,
              {
                backgroundColor: colors.primary[100],
                borderColor: colors.primary[500],
              },
            ]}
          >
            <View
              style={[
                styles.orbitDotCore,
                { backgroundColor: colors.secondary[500] },
              ]}
            />
          </View>
        </Animated.View>
        <Animated.View style={logoStyle}>
          <AppLogo size={136} testID="app-intro-logo" />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
  },
  orbitTrack: {
    position: "absolute",
    width: 218,
    height: 218,
    borderRadius: 109,
    borderWidth: 2,
    alignItems: "center",
  },
  orbitDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginTop: -9,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitDotCore: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
