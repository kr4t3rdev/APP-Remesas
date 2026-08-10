import {
  hexToRgba,
  getFintechTabBarColors,
  floatingTabBarMetrics,
  getFintechTabBarStyle,
} from "./fintechTabBar";
import { THEMES, THEME_LIST } from "../theme";

const ocean = THEMES.ocean;

describe("fintech tab bar styling", () => {
  const lightColors = getFintechTabBarColors(ocean.colors, false);
  const darkColors = getFintechTabBarColors(ocean.darkColors, true);

  it("keeps the tab bar above the home indicator", () => {
    expect(getFintechTabBarStyle(34, lightColors, false)).toMatchObject({
      height: floatingTabBarMetrics.height,
      left: 44,
      right: 44,
      bottom: 34 + floatingTabBarMetrics.bottom,
      position: "absolute",
    });
  });

  it("uses separate light and dark surfaces derived from the theme", () => {
    expect(getFintechTabBarStyle(0, lightColors, false)).toMatchObject({
      backgroundColor: "transparent",
      borderColor: hexToRgba(ocean.colors.text.secondary, 0.32),
    });
    expect(getFintechTabBarStyle(0, darkColors, true)).toMatchObject({
      backgroundColor: "transparent",
      borderColor: hexToRgba(ocean.darkColors.border, 0.7),
    });
  });

  it("uses fully opaque surfaces when transparency is reduced", () => {
    expect(getFintechTabBarStyle(0, lightColors, false, true)).toMatchObject({
      backgroundColor: ocean.colors.card,
      borderColor: ocean.colors.text.secondary,
    });
    expect(getFintechTabBarStyle(0, darkColors, true, true)).toMatchObject({
      backgroundColor: ocean.darkColors.card,
      borderColor: ocean.darkColors.text.secondary,
    });
  });

  it("keeps the configured translucent surfaces", () => {
    expect(lightColors.background).toBe("rgba(255, 255, 255, 0.32)");
    expect(darkColors.background).toBe(hexToRgba(ocean.darkColors.background, 0.38));
    expect(darkColors.opaqueBackground).toBe(ocean.darkColors.card);
  });

  it("follows the active theme primary for selected and inactive colors", () => {
    expect(lightColors).toMatchObject({
      active: ocean.colors.primary[500],
      activeBackground: hexToRgba(ocean.colors.primary[500], 0.12),
      inactive: ocean.colors.text.secondary,
    });
    expect(darkColors).toMatchObject({
      active: ocean.darkColors.primary[500],
      activeBackground: hexToRgba(ocean.darkColors.border, 0.7),
      inactive: ocean.darkColors.text.secondary,
    });
  });

  it("recolors the selected accent for every registered theme", () => {
    for (const theme of THEME_LIST) {
      const light = getFintechTabBarColors(theme.colors, false);
      const dark = getFintechTabBarColors(theme.darkColors, true);
      expect(light.active).toBe(theme.colors.primary[500]);
      expect(light.inactive).toBe(theme.colors.text.secondary);
      expect(dark.active).toBe(theme.darkColors.primary[500]);
      expect(dark.inactive).toBe(theme.darkColors.text.secondary);
    }
  });

  it("keeps dark borders at or above 3:1 contrast against the opaque surface", () => {
    const relativeLuminance = (hex: string) => {
      const channels = [1, 3, 5].map((offset) =>
        Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
      );
      const linear = channels.map((channel) =>
        channel <= 0.03928
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      );
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const contrast = (foreground: string, background: string) => {
      const foregroundLuminance = relativeLuminance(foreground);
      const backgroundLuminance = relativeLuminance(background);
      const lighter = Math.max(foregroundLuminance, backgroundLuminance);
      const darker = Math.min(foregroundLuminance, backgroundLuminance);
      return (lighter + 0.05) / (darker + 0.05);
    };

    for (const theme of THEME_LIST) {
      const dark = getFintechTabBarColors(theme.darkColors, true);
      expect(contrast(dark.opaqueBorder, dark.opaqueBackground)).toBeGreaterThanOrEqual(3);
    }
  });
});
