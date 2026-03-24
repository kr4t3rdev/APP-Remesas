import { create } from "zustand";
import {
  colors,
  darkColors,
  shadows,
  darkShadows,
  gradientPresets,
} from "../theme";

type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  currentColors: typeof colors;
  currentShadows: typeof shadows;
  gradients: typeof gradientPresets;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  isDark: false,
  currentColors: colors,
  currentShadows: shadows,
  gradients: gradientPresets,

  toggleTheme: () => {
    const newMode = get().mode === "light" ? "dark" : "light";
    set({
      mode: newMode,
      isDark: newMode === "dark",
      currentColors: newMode === "dark" ? darkColors : colors,
      currentShadows: newMode === "dark" ? darkShadows : shadows,
    });
  },

  setTheme: (mode: ThemeMode) => {
    set({
      mode,
      isDark: mode === "dark",
      currentColors: mode === "dark" ? darkColors : colors,
      currentShadows: mode === "dark" ? darkShadows : shadows,
    });
  },
}));

export const useColors = () => useThemeStore((state) => state.currentColors);
export const useShadows = () => useThemeStore((state) => state.currentShadows);
export const useGradients = () => useThemeStore((state) => state.gradients);
export const useIsDark = () => useThemeStore((state) => state.isDark);
