import {
  floatingTabBarMetrics,
  getFintechTabBarStyle,
} from "./fintechTabBar";

describe("fintech tab bar styling", () => {
  it("keeps the tab bar above the home indicator", () => {
    expect(getFintechTabBarStyle(34, false)).toMatchObject({
      height: floatingTabBarMetrics.height,
      bottom: 34 + floatingTabBarMetrics.bottom,
      position: "absolute",
    });
  });

  it("uses separate light and dark fintech surfaces", () => {
    expect(getFintechTabBarStyle(0, false)).toMatchObject({
      backgroundColor: "rgba(255, 255, 255, 0.82)",
      borderColor: "rgba(226, 232, 240, 0.6)",
    });
    expect(getFintechTabBarStyle(0, true)).toMatchObject({
      backgroundColor: "rgba(17, 24, 39, 0.82)",
      borderColor: "rgba(51, 65, 85, 0.6)",
    });
  });
});
