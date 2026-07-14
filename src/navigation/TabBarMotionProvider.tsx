import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import {
  createTabBarScrollState,
  updateTabBarScrollState,
  type TabBarDisplay,
} from "./tabBarMotion";

interface TabBarMotionContextValue {
  progress: Animated.Value;
  display: TabBarDisplay;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  registerScrollToTop: (routeName: string, callback: () => void) => () => void;
  requestScrollToTop: (routeName: string) => void;
  expand: () => void;
}

const TabBarMotionContext = createContext<TabBarMotionContextValue | null>(null);

export const TabBarMotionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const scrollState = useRef(createTabBarScrollState());
  const [display, setDisplay] = useState<TabBarDisplay>("expanded");
  const [reduceMotion, setReduceMotion] = useState(false);
  const scrollToTopCallbacks = useRef(new Map<string, () => void>());

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
    const toValue = display === "emphasized" ? 1 : 0;
    if (reduceMotion) {
      progress.setValue(toValue);
      return;
    }

    Animated.timing(progress, {
      toValue,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [display, progress, reduceMotion]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = updateTabBarScrollState(
        scrollState.current,
        event.nativeEvent.contentOffset.y,
      );
      scrollState.current = next;
      setDisplay((current) => (current === next.display ? current : next.display));
    },
    [],
  );

  const registerScrollToTop = useCallback(
    (routeName: string, callback: () => void) => {
      scrollToTopCallbacks.current.set(routeName, callback);
      return () => {
        if (scrollToTopCallbacks.current.get(routeName) === callback) {
          scrollToTopCallbacks.current.delete(routeName);
        }
      };
    },
    [],
  );

  const requestScrollToTop = useCallback((routeName: string) => {
    scrollToTopCallbacks.current.get(routeName)?.();
  }, []);

  const expand = useCallback(() => {
    scrollState.current = createTabBarScrollState();
    setDisplay("expanded");
    progress.stopAnimation();
    progress.setValue(0);
  }, [progress]);

  const value = useMemo(
    () => ({ progress, display, onScroll, registerScrollToTop, requestScrollToTop, expand }),
    [display, expand, onScroll, progress, registerScrollToTop, requestScrollToTop],
  );

  return (
    <TabBarMotionContext.Provider value={value}>
      {children}
    </TabBarMotionContext.Provider>
  );
};

export const useTabBarMotion = () => {
  const value = useContext(TabBarMotionContext);
  if (!value) {
    throw new Error("useTabBarMotion must be used inside TabBarMotionProvider");
  }
  return value;
};

export const useTabBarScrollBehavior = () => {
  const { onScroll } = useTabBarMotion();
  return { onScroll, scrollEventThrottle: 16 as const };
};

export const useTabScrollToTop = (
  routeName: string,
  callback: () => void,
) => {
  const { registerScrollToTop } = useTabBarMotion();

  useEffect(
    () => registerScrollToTop(routeName, callback),
    [callback, registerScrollToTop, routeName],
  );
};
