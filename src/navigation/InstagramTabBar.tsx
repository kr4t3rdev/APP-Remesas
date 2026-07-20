import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AccessibilityInfo,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useIsDark } from "../store/themeStore";
import { mainTabDefinitions } from "./mainTabsConfig";
import {
  fintechTabBarColors,
  getFintechTabBarStyle,
} from "./fintechTabBar";
import { useTabBarMotion } from "./TabBarMotionProvider";

export const TAB_BAR_EMPHASIS_MOTION = {
  barScaleX: 1.07,
  barScaleY: 1.09,
  iconScale: 1.08,
  labelScale: 1.06,
  labelOpacity: 1,
} as const;

export const InstagramTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets,
}) => {
  const isDark = useIsDark();
  const colors = fintechTabBarColors[isDark ? "dark" : "light"];
  const { progress, requestScrollToTop, expand } = useTabBarMotion();
  const [barWidth, setBarWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const indicatorIndex = useRef(new Animated.Value(state.index)).current;
  const pressScales = useRef(
    state.routes.map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const accessibilityInfo = AccessibilityInfo as typeof AccessibilityInfo & {
      isReduceTransparencyEnabled?: () => Promise<boolean>;
    };
    const readReduceTransparency = accessibilityInfo.isReduceTransparencyEnabled;

    if (typeof readReduceTransparency !== "function") {
      return;
    }

    let mounted = true;
    readReduceTransparency()
      .then((enabled) => {
        if (mounted) setReduceTransparency(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      indicatorIndex.setValue(state.index);
      return;
    }

    Animated.timing(indicatorIndex, {
      toValue: state.index,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [indicatorIndex, reduceMotion, state.index]);

  useEffect(() => {
    expand();
  }, [expand, state.index]);

  const animatePress = (index: number, toValue: number) => {
    if (reduceMotion) {
      pressScales[index].setValue(toValue);
      return;
    }

    Animated.spring(pressScales[index], {
      toValue,
      speed: 30,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const itemWidth = barWidth > 0 ? barWidth / state.routes.length : 0;
  const indicatorTranslateX = indicatorIndex.interpolate({
    inputRange: state.routes.map((_, index) => index),
    outputRange: state.routes.map((_, index) => itemWidth * index),
  });

  if (keyboardVisible) return null;

  return (
    <Animated.View
      testID="floating-tab-bar"
      style={[
        getFintechTabBarStyle(insets.bottom, isDark, reduceTransparency),
        {
          transform: [
            {
              scaleX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, TAB_BAR_EMPHASIS_MOTION.barScaleX],
              }),
            },
            {
              scaleY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, TAB_BAR_EMPHASIS_MOTION.barScaleY],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={styles.itemsRow}
        onLayout={({ nativeEvent }) => setBarWidth(nativeEvent.layout.width)}
      >
        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
              style={[
                  styles.activeIndicator,
                  {
                    left: itemWidth / 2 - 24,
                backgroundColor: colors.activeBackground,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
        )}
        {state.routes.map((route, index) => {
          const definition = mainTabDefinitions.find(
            ({ route: configuredRoute }) => configuredRoute === route.name,
          );
          const options = descriptors[route.key]?.options ?? {};
          const focused = state.index === index;
          const label = definition?.label ?? route.name;
          const icon = definition?.icon ?? "ellipse";
          const emphasized = definition?.emphasized ?? false;

          const handlePress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              if (focused) {
                requestScrollToTop(route.name);
              } else if (
                typeof (navigation as typeof navigation & { jumpTo?: (name: string) => void }).jumpTo ===
                "function"
              ) {
                (navigation as typeof navigation & { jumpTo: (name: string) => void }).jumpTo(route.name);
              } else {
                navigation.navigate(route.name, route.params);
              }
            }
          };

          const handleLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Animated.View
              key={route.key}
              style={[
                styles.tabItemWrapper,
                { transform: [{ scale: pressScales[index] }] },
              ]}
            >
              <Pressable
                testID={`tab-${route.name}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                accessibilityHint={
                  focused
                    ? "Pestaña seleccionada. Toca de nuevo para volver al inicio."
                    : `Abre la pestaña ${label}.`
                }
                hitSlop={{ top: 4, right: 2, bottom: 4, left: 2 }}
                onPress={handlePress}
                onLongPress={handleLongPress}
                onPressIn={() => animatePress(index, 0.94)}
                onPressOut={() => animatePress(index, 1)}
                style={styles.tabItem}
              >
                <View
                  style={[
                    styles.iconContainer,
                    emphasized && styles.emphasizedIconContainer,
                    focused &&
                      barWidth === 0 && {
                        backgroundColor: colors.activeBackground,
                      },
                  ]}
                >
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, TAB_BAR_EMPHASIS_MOTION.iconScale],
                          }),
                        },
                      ],
                    }}
                  >
                    <Ionicons
                      name={icon}
                      size={emphasized ? 36 : 22}
                      color={
                        focused || emphasized ? colors.active : colors.inactive
                      }
                    />
                  </Animated.View>
                </View>
                {!emphasized && (
                  <Animated.Text
                    numberOfLines={1}
                    style={[
                      styles.label,
                      { color: focused ? colors.active : colors.inactive },
                      {
                        opacity: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, TAB_BAR_EMPHASIS_MOTION.labelOpacity],
                        }),
                        transform: [
                          {
                            scale: progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, TAB_BAR_EMPHASIS_MOTION.labelScale],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {label}
                  </Animated.Text>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  itemsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabItem: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    top: 4,
    width: 48,
    height: 38,
    borderRadius: 19,
  },
  iconContainer: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emphasizedIconContainer: {
    width: 48,
    height: 42,
    borderRadius: 21,
  },
  label: {
    maxWidth: "100%",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
});
