import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { THEMES } from "../theme/palettes";
import type { ThemeId, ThemePalette } from "../theme/palettes";

export type ThemeMode = "light" | "dark";

type ThemeColors = ThemePalette["colors"];
type ThemeGradients = ThemePalette["gradients"];
type ThemeShadows = ThemePalette["shadows"];

interface ThemeState {
  themeId: ThemeId;
  mode: ThemeMode;
  isDark: boolean;
  currentColors: ThemeColors;
  currentShadows: ThemeShadows;
  gradients: ThemeGradients;
  setThemeId: (themeId: ThemeId) => void;
  setTheme: (mode: ThemeMode) => void;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: "ocean",
      mode: "light",
      isDark: false,
      currentColors: THEMES.ocean.colors,
      currentShadows: THEMES.ocean.shadows,
      gradients: THEMES.ocean.gradients,

      setThemeId: (themeId) => {
        const theme = THEMES[themeId];
        const isDark = get().mode === "dark";
        set({
          themeId,
          currentColors: isDark ? theme.darkColors : theme.colors,
          currentShadows: isDark ? theme.darkShadows : theme.shadows,
          gradients: theme.gradients,
        });
      },

      setTheme: (mode) => get().setMode(mode),

      setMode: (mode) => {
        const theme = THEMES[get().themeId];
        const isDark = mode === "dark";
        set({
          mode,
          isDark,
          currentColors: isDark ? theme.darkColors : theme.colors,
          currentShadows: isDark ? theme.darkShadows : theme.shadows,
        });
      },

      toggleTheme: () => {
        get().setMode(get().mode === "light" ? "dark" : "light");
      },
    }),
    {
      name: "app-theme",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeId: state.themeId,
        mode: state.mode,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<
          Pick<ThemeState, "themeId" | "mode">
        >;
        const themeId: ThemeId =
          p.themeId && THEMES[p.themeId] ? p.themeId : "ocean";
        const mode: ThemeMode = p.mode === "dark" ? "dark" : "light";
        const theme = THEMES[themeId];
        const isDark = mode === "dark";
        return {
          ...current,
          themeId,
          mode,
          isDark,
          currentColors: isDark ? theme.darkColors : theme.colors,
          currentShadows: isDark ? theme.darkShadows : theme.shadows,
          gradients: theme.gradients,
        };
      },
    },
  ),
);

export const useColors = () => useThemeStore((state) => state.currentColors);
export const useShadows = () => useThemeStore((state) => state.currentShadows);
export const useGradients = () => useThemeStore((state) => state.gradients);
export const useIsDark = () => useThemeStore((state) => state.isDark);
export const useThemeId = () => useThemeStore((state) => state.themeId);
export const useMode = () => useThemeStore((state) => state.mode);
