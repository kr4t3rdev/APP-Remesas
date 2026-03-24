import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  TouchableOpacity,
  Easing,
  StyleProp,
} from "react-native";

type AnimatedWrapperProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export const FadeIn: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
};

export const FadeInDown: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, duration, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export const FadeInUp: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, duration, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export const ScaleIn: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, duration, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
};

export const BounceInAnim: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  style,
}) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scale, {
        toValue: 1.1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, delay]);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
};

export const SlideInRightAnim: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const translateX = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 100,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacity, duration, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
};

export const SlideInLeftAnim: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const translateX = useRef(new Animated.Value(-300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 100,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacity, duration, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
};

type StaggerListProps = {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
};

export const StaggerList: React.FC<StaggerListProps> = ({
  children,
  staggerDelay = 100,
  initialDelay = 0,
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeInDown key={index} delay={initialDelay + index * staggerDelay}>
          {child}
        </FadeInDown>
      ))}
    </>
  );
};

type AnimatedNumberProps = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: any;
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 2,
  style,
  textStyle,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value, duration, animatedValue]);

  const formatNumber = (num: number) => {
    return num.toFixed(decimals);
  };

  return (
    <View style={style}>
      <Animated.Text style={textStyle}>
        {prefix}
        {formatNumber(value)}
        {suffix}
      </Animated.Text>
    </View>
  );
};

type LoadingDotsProps = {
  size?: number;
  color?: string;
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 8,
  color = "#6366F1",
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const createAnimation = (animatedValue: Animated.Value, delayMs: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );
  };

  useEffect(() => {
    createAnimation(dot1, 0).start();
    createAnimation(dot2, 150).start();
    createAnimation(dot3, 300).start();
  }, [dot1, dot2, dot3]);

  const scaleInterpolate = (animValue: Animated.Value) =>
    animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1.2],
    });

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            backgroundColor: color,
            opacity: dot1,
            transform: [{ scale: scaleInterpolate(dot1) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            backgroundColor: color,
            opacity: dot2,
            transform: [{ scale: scaleInterpolate(dot2) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            backgroundColor: color,
            opacity: dot3,
            transform: [{ scale: scaleInterpolate(dot3) }],
          },
        ]}
      />
    </View>
  );
};

type PulseLoaderProps = {
  size?: number;
  color?: string;
};

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 40,
  color = "#6366F1",
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        { transform: [{ scale }], opacity },
      ]}
    />
  );
};

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#E5E5EA",
        },
        { opacity },
        style,
      ]}
    />
  );
};

type PressableScaleProps = {
  children: React.ReactNode;
  onPress: () => void;
  scale?: number;
  style?: StyleProp<ViewStyle>;
};

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  scale = 0.95,
  style,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: scale,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    borderRadius: 999,
  },
  pulse: {},
});
