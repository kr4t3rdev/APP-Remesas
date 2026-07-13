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
      backgroundColor: "rgba(15, 23, 42, 0.94)",
      borderColor: "rgba(148, 163, 184, 0.3)",
    });
  });

  it("uses fully opaque surfaces when transparency is reduced", () => {
    expect(getFintechTabBarStyle(0, false, true)).toMatchObject({
      backgroundColor: "#FFFFFF",
      borderColor: "#94A3B8",
    });
    expect(getFintechTabBarStyle(0, true, true)).toMatchObject({
      backgroundColor: "#0F172A",
      borderColor: "#64748B",
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
      active: "#C7D2FE",
      inactive: "#CBD5E1",
    });
  });
});
