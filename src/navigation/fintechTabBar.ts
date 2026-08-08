import type { ViewStyle } from "react-native";

export type FintechTabBarColors = {
  background: string;
  opaqueBackground: string;
  border: string;
  opaqueBorder: string;
  active: string;
  activeBackground: string;
  inactive: string;
};

export const floatingTabBarMetrics = {
  bottom: 14,
  height: 64,
  actionBottom: 108,
  standaloneActionBottom: 152,
  contentBottomPadding: 180,
} as const;

export const fintechTabBarColors: Record<"light" | "dark", FintechTabBarColors> = {
  light: {
    background: "rgba(255, 255, 255, 0.32)",
    opaqueBackground: "#FFFFFF",
    border: "rgba(148, 163, 184, 0.42)",
    opaqueBorder: "#94A3B8",
    active: "#4338CA",
    activeBackground: "rgba(67, 56, 202, 0.12)",
    inactive: "#475569",
  },
  dark: {
    background: "rgba(8, 26, 30, 0.38)",
    opaqueBackground: "#10272C",
    border: "rgba(79, 143, 154, 0.7)",
    opaqueBorder: "#4F8F9A",
    active: "#67E8F9",
    activeBackground: "rgba(36, 71, 78, 0.7)",
    inactive: "#A3C0C5",
  },
};

export const getFintechTabBarStyle = (
  bottomInset: number,
  isDark: boolean,
  reduceTransparency = false,
): ViewStyle => {
  const theme = fintechTabBarColors[isDark ? "dark" : "light"];

  return {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: bottomInset + floatingTabBarMetrics.bottom,
    backgroundColor: reduceTransparency ? theme.opaqueBackground : "transparent",
    borderColor: reduceTransparency ? theme.opaqueBorder : theme.border,
    borderWidth: 1,
    borderRadius: 28,
    height: floatingTabBarMetrics.height,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.38 : 0.16,
    shadowRadius: 12,
    elevation: 9,
    overflow: "visible",
  };
};
