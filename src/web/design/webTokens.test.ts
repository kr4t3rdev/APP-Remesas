import { webBreakpoints, webMetrics, webMotion } from "./webTokens";

describe("web design contract", () => {
  it("keeps controls and focus targets usable at desktop density", () => {
    expect(webMetrics.controlHeight).toBeGreaterThanOrEqual(40);
    expect(webMetrics.touchTarget).toBeGreaterThanOrEqual(44);
    expect(webMetrics.panelRadius).toBeLessThanOrEqual(16);
  });

  it("defines structural breakpoints instead of fluid typography breakpoints", () => {
    expect(webBreakpoints.tablet).toBe(768);
    expect(webBreakpoints.desktop).toBe(1024);
    expect(webBreakpoints.wide).toBe(1440);
  });

  it("keeps interaction motion short and reduced-motion safe", () => {
    expect(webMotion.standardMs).toBeGreaterThanOrEqual(150);
    expect(webMotion.standardMs).toBeLessThanOrEqual(250);
    expect(webMotion.reducedMs).toBe(0);
  });
});
