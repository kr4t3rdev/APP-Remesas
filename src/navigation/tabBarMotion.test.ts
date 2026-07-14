import {
  createTabBarScrollState,
  updateTabBarScrollState,
  type TabBarScrollState,
} from "./tabBarMotion";

describe("tab bar scroll motion", () => {
  it("emphasizes after 16pt of accumulated downward scroll", () => {
    let state = createTabBarScrollState(30);
    state = updateTabBarScrollState(state, 38);
    expect(state.display).toBe("expanded");

    state = updateTabBarScrollState(state, 46);
    expect(state.display).toBe("emphasized");
  });

  it("returns to normal after 16pt of accumulated upward scroll", () => {
    let state: TabBarScrollState = { ...createTabBarScrollState(80), display: "emphasized" };
    state = updateTabBarScrollState(state, 72);
    expect(state.display).toBe("emphasized");

    state = updateTabBarScrollState(state, 64);
    expect(state.display).toBe("expanded");
  });

  it("keeps the bar expanded inside the 24pt top guard", () => {
    let state: TabBarScrollState = { ...createTabBarScrollState(50), display: "emphasized" };
    state = updateTabBarScrollState(state, 24);
    expect(state.display).toBe("expanded");

    state = updateTabBarScrollState(state, 30);
    expect(state.display).toBe("expanded");
  });

  it("ignores negative bounce and micro movements", () => {
    let state = createTabBarScrollState(0);
    state = updateTabBarScrollState(state, -18);
    state = updateTabBarScrollState(state, 0.4);
    state = updateTabBarScrollState(state, 0.8);

    expect(state).toMatchObject({ display: "expanded", accumulated: 0 });
  });

  it("resets accumulated distance when direction changes", () => {
    let state = createTabBarScrollState(40);
    state = updateTabBarScrollState(state, 50);
    state = updateTabBarScrollState(state, 44);
    state = updateTabBarScrollState(state, 38);

    expect(state.display).toBe("expanded");
    expect(state.accumulated).toBe(-12);
  });
});
