import type { ViewStyle } from "react-native";

export type FintechTabBarColors = {
  background: string;
  border: string;
  active: string;
  activeBackground: string;
  inactive: string;
};

export const floatingTabBarMetrics = {
  bottom: 24,
  height: 64,
  actionBottom: 108,
  standaloneActionBottom: 152,
  contentBottomPadding: 108,
} as const;

export const fintechTabBarColors: Record<"light" | "dark", FintechTabBarColors> = {
  light: {
    background: "rgba(255, 255, 255, 0.82)",
    border: "rgba(226, 232, 240, 0.6)",
    active: "#4F46E5",
    activeBackground: "rgba(79, 70, 229, 0.1)",
    inactive: "#64748B",
  },
  dark: {
    background: "rgba(17, 24, 39, 0.82)",
    border: "rgba(51, 65, 85, 0.6)",
    active: "#A5B4FC",
    activeBackground: "rgba(165, 180, 252, 0.12)",
    inactive: "#94A3B8",
  },
};

export const getFintechTabBarStyle = (
  bottomInset: number,
  isDark: boolean,
): ViewStyle => {
  const theme = fintechTabBarColors[isDark ? "dark" : "light"];

  return {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: bottomInset + floatingTabBarMetrics.bottom,
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 28,
    height: floatingTabBarMetrics.height,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.32 : 0.14,
    shadowRadius: 10,
    elevation: 8,
    overflow: "visible",
  };
};
