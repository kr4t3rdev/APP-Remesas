import React, { useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";

// --- Constants ---
const BUTTON_HEIGHT = 48;
const ICON_SIZE = 24;

interface DeleteButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onPress,
  style,
  label = "Delete",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Animated Values ---
  const lidRotation = useRef(new Animated.Value(0)).current;
  const trashY = useRef(new Animated.Value(-15)).current;
  const trashOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(1)).current;

  // Entrance Animations
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(-20)).current;
  const iconTranslateY = useRef(new Animated.Value(-20)).current;

  // --- Entrance Effect ---
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(textTranslateX, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconTranslateY, {
        toValue: 0,
        friction: 6,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // --- Interaction Animation Logic ---
  const handlePress = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Sequence
    Animated.parallel([
      // 1. Text Pulse
      Animated.sequence([
        Animated.timing(textScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),

      // 2. Icon Animation Sequence
      Animated.sequence([
        // Open Lid
        Animated.spring(lidRotation, {
          toValue: 1, // 1 maps to -45deg
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),

        // Drop Trash (Parallel with lid staying open)
        Animated.parallel([
          Animated.timing(trashOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(trashY, {
              toValue: 5,
              duration: 600,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
            // Hide trash after falling
            Animated.timing(trashOpacity, {
              toValue: 0,
              duration: 200,
              delay: 300,
              useNativeDriver: true,
            }),
            // Reset trash position silently
            Animated.timing(trashY, {
              toValue: -15,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Close Lid
        Animated.spring(lidRotation, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished && onPress) {
        setIsAnimating(false);
        onPress();
      }
    });
  };

  // --- Interpolations ---
  const lidRotateStr = lidRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
  });

  // Animated Components
  const AnimatedG: React.ComponentType<any> = Animated.createAnimatedComponent(G);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <View style={styles.contentContainer}>
        {/* Animated Text */}
        <Animated.Text
          style={[
            styles.text,
            {
              opacity: entranceOpacity,
              transform: [{ translateX: textTranslateX }, { scale: textScale }],
            },
          ]}
        >
          {label}
        </Animated.Text>

        {/* Animated Icon Container */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: entranceOpacity,
              transform: [{ translateY: iconTranslateY }],
            },
          ]}
        >
          <Svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
          >
            {/* Trash Particles (Behind Body, Under Lid) */}
            <AnimatedG
              style={{ opacity: trashOpacity, transform: [{ translateY: trashY }] } as any}
            >
              <Circle cx="10" cy="8" r="1.5" fill="white" />
              <Circle cx="14" cy="6" r="1.5" fill="white" />
              <Path d="M12 7 L13 9 L11 9 Z" fill="white" />
            </AnimatedG>

            {/* Trash Can Body (Static) */}
            <Path
              d="M6 7 L7 20 C7 21 8 22 9 22 H15 C16 22 17 21 17 20 L18 7 H6 Z"
              stroke="white"
              strokeWidth="2"
              fill="transparent"
            />
            <Path
              d="M10 11 V18"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Path
              d="M14 11 V18"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Trash Can Lid (Animated) */}
            <AnimatedG
              style={{
                transform: [
                  { translateX: 12 },
                  { translateY: 5 },
                  { rotate: lidRotateStr },
                  { translateX: -12 },
                  { translateY: -5 },
                ],
              } as any}
            >
              <Path d="M10 3 H14 V5 H10 V3 Z" fill="white" />
              <Path d="M4 5 H20 V7 H4 V5 Z" fill="white" />
            </AnimatedG>
          </Svg>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EF4444", // Red-500
    borderRadius: 12,
    height: BUTTON_HEIGHT,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    minWidth: 120,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
});
