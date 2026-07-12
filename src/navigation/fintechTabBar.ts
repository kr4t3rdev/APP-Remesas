import type { ViewStyle } from "react-native";

export type FintechTabBarColors = {
  background: string;
  border: string;
  active: string;
  activeBackground: string;
  inactive: string;
};

export const floatingTabBarMetrics = {
  bottom: 12,
  height: 64,
  actionBottom: 96,
  standaloneActionBottom: 140,
  contentBottomPadding: 96,
} as const;

export const fintechTabBarColors: Record<"light" | "dark", FintechTabBarColors> = {
  light: {
    background: "#FFFFFF",
    border: "#E2E8F0",
    active: "#4F46E5",
    activeBackground: "#EEF2FF",
    inactive: "#64748B",
  },
  dark: {
    background: "#111827",
    border: "#334155",
    active: "#A5B4FC",
    activeBackground: "#27335C",
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
    left: 16,
    right: 16,
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
  };
};
