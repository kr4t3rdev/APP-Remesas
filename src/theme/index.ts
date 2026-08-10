import { THEMES } from "./palettes";

export { THEMES, THEME_LIST } from "./palettes";
export type { ThemeId, ThemePalette } from "./palettes";

export const colors = THEMES.ocean.colors;
export const darkColors = THEMES.ocean.darkColors;
export const gradientPresets = THEMES.ocean.gradients;
export const shadows = THEMES.ocean.shadows;
export const darkShadows = THEMES.ocean.darkShadows;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const header = {
  height: 64,
  searchMaxWidth: 480,
};

export const gridColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

export const sidebar = {
  expandedWidth: 260,
  collapsedWidth: 72,
  itemHeight: 48,
};
