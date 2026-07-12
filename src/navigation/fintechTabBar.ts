import type { ViewStyle } from "react-native";

export const fintechTabBarColors = {
  background: "#0B1220",
  active: "#A5B4FC",
  activeBackground: "#27335C",
  inactive: "#94A3B8",
};

export const getFintechTabBarStyle = (bottomInset: number): ViewStyle => ({
  backgroundColor: fintechTabBarColors.background,
  borderTopWidth: 0,
  height: 64 + bottomInset,
  paddingTop: 10,
  paddingBottom: 8 + bottomInset,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.24,
  shadowRadius: 12,
  elevation: 12,
});
