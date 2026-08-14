export const webBreakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const webMetrics = {
  controlHeight: 44,
  compactControlHeight: 36,
  touchTarget: 44,
  panelRadius: 12,
  fieldRadius: 8,
  sidebarWidth: 248,
  compactSidebarWidth: 72,
  topbarHeight: 64,
  contentMaxWidth: 1440,
} as const;

export const webMotion = {
  standardMs: 180,
  emphasizedMs: 220,
  reducedMs: 0,
} as const;

export const webType = {
  family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  bodySize: 15,
  labelSize: 13,
  titleSize: 28,
  pageTitleSize: 32,
} as const;

export const webSemanticColors = {
  positive: "#157347",
  negative: "#B42318",
  warning: "#9A6700",
  focus: "#2563EB",
} as const;
