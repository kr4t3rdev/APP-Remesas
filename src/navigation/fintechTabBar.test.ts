import { getFintechTabBarStyle } from "./fintechTabBar";

describe("fintech tab bar styling", () => {
  it("keeps the tab bar above the home indicator", () => {
    expect(getFintechTabBarStyle(34)).toMatchObject({
      height: 98,
      paddingBottom: 42,
      borderTopWidth: 0,
    });
  });

  it("uses a dark elevated surface for the fintech treatment", () => {
    expect(getFintechTabBarStyle(0)).toMatchObject({
      backgroundColor: "#0B1220",
      elevation: 12,
    });
  });
});
