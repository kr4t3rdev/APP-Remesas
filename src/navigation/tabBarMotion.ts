export const TAB_BAR_SCROLL_THRESHOLD = 16;
export const TAB_BAR_TOP_GUARD = 24;
export const TAB_BAR_MICRO_MOVEMENT = 1;

export type TabBarDisplay = "expanded" | "emphasized";

export interface TabBarScrollState {
  display: TabBarDisplay;
  lastOffset: number;
  accumulated: number;
}

export const createTabBarScrollState = (offset = 0): TabBarScrollState => ({
  display: "expanded",
  lastOffset: Math.max(0, offset),
  accumulated: 0,
});

export const updateTabBarScrollState = (
  state: TabBarScrollState,
  rawOffset: number,
): TabBarScrollState => {
  const offset = Math.max(0, rawOffset);

  if (offset <= TAB_BAR_TOP_GUARD) {
    return { display: "expanded", lastOffset: offset, accumulated: 0 };
  }

  const delta = offset - state.lastOffset;
  if (Math.abs(delta) < TAB_BAR_MICRO_MOVEMENT) {
    return { ...state, lastOffset: offset };
  }

  const sameDirection =
    state.accumulated === 0 || Math.sign(state.accumulated) === Math.sign(delta);
  const accumulated = sameDirection ? state.accumulated + delta : delta;

  if (accumulated >= TAB_BAR_SCROLL_THRESHOLD) {
    return { display: "emphasized", lastOffset: offset, accumulated: 0 };
  }

  if (accumulated <= -TAB_BAR_SCROLL_THRESHOLD) {
    return { display: "expanded", lastOffset: offset, accumulated: 0 };
  }

  return { ...state, lastOffset: offset, accumulated };
};
