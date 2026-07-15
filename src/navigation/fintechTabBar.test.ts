import {
  fintechTabBarColors,
  floatingTabBarMetrics,
  getFintechTabBarStyle,
} from "./fintechTabBar";

describe("fintech tab bar styling", () => {
  it("keeps the tab bar above the home indicator", () => {
    expect(getFintechTabBarStyle(34, false)).toMatchObject({
      height: floatingTabBarMetrics.height,
      left: 44,
      right: 44,
      bottom: 34 + floatingTabBarMetrics.bottom,
      position: "absolute",
    });
  });

  it("uses separate light and dark fintech surfaces", () => {
    expect(getFintechTabBarStyle(0, false)).toMatchObject({
      backgroundColor: "rgba(255, 255, 255, 0.94)",
      borderColor: "rgba(148, 163, 184, 0.42)",
    });
    expect(getFintechTabBarStyle(0, true)).toMatchObject({
      backgroundColor: "rgba(8, 26, 30, 0.94)",
      borderColor: "rgba(79, 143, 154, 0.7)",
    });
  });

  it("uses fully opaque surfaces when transparency is reduced", () => {
    expect(getFintechTabBarStyle(0, false, true)).toMatchObject({
      backgroundColor: "#FFFFFF",
      borderColor: "#94A3B8",
    });
    expect(getFintechTabBarStyle(0, true, true)).toMatchObject({
      backgroundColor: "#10272C",
      borderColor: "#4F8F9A",
    });
  });

  it("keeps the configured surfaces", () => {
    expect(getFintechTabBarStyle(0, false)).toMatchObject({
      backgroundColor: "rgba(255, 255, 255, 0.94)",
      borderColor: "rgba(148, 163, 184, 0.42)",
    });
  });

  it("keeps readable inactive and selected colors in both appearances", () => {
    expect(fintechTabBarColors.light).toMatchObject({
      active: "#4338CA",
      inactive: "#475569",
    });
    expect(fintechTabBarColors.dark).toMatchObject({
      background: "rgba(8, 26, 30, 0.94)",
      opaqueBackground: "#10272C",
      border: "rgba(79, 143, 154, 0.7)",
      opaqueBorder: "#4F8F9A",
      active: "#67E8F9",
      activeBackground: "rgba(36, 71, 78, 0.7)",
      inactive: "#A3C0C5",
    });
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

    expect(contrast(fintechTabBarColors.dark.opaqueBorder, fintechTabBarColors.dark.opaqueBackground)).toBeGreaterThanOrEqual(3);
  });
});
