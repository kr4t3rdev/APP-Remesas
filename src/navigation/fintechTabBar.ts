import type { ViewStyle } from "react-native";
import type { ThemePalette } from "../theme";

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

export const hexToRgba = (hex: string, alpha: number): string => {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getFintechTabBarColors = (
  themeColors: ThemePalette["colors"],
  isDark: boolean,
): FintechTabBarColors => {
  const { card, background, border, text, primary } = themeColors;
  return {
    background: isDark
      ? hexToRgba(background, 0.38)
      : "rgba(255, 255, 255, 0.32)",
    opaqueBackground: card,
    border: isDark
      ? hexToRgba(border, 0.7)
      : hexToRgba(text.secondary, 0.32),
    opaqueBorder: text.secondary,
    active: primary[500],
    activeBackground: isDark
      ? hexToRgba(border, 0.7)
      : hexToRgba(primary[500], 0.12),
    inactive: text.secondary,
  };
};

export const getFintechTabBarStyle = (
  bottomInset: number,
  colors: FintechTabBarColors,
  isDark: boolean,
  reduceTransparency = false,
): ViewStyle => {
  return {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: bottomInset + floatingTabBarMetrics.bottom,
    backgroundColor: reduceTransparency ? colors.opaqueBackground : "transparent",
    borderColor: reduceTransparency ? colors.opaqueBorder : colors.border,
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
