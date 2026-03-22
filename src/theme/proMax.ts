// Pro Max design tokens scaffold. This file provides a lightweight token set
// to be consumed by UI wrappers and surfaces. It is intentionally minimal and
// ASCII-only to ensure broad compatibility.

export const PRO_MAX_THEME = {
  colors: {
    background: '#F3F4F6', // light gray background
    surface: '#FFFFFF',    // white card surface
    text: '#111827',
    primary: '#4F46E5',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system',
    fontSize: 16,
  },
  spacing: {
    s: 8,
    m: 12,
    l: 16,
  },
  elevation: {
    level0: 0,
    level1: 1,
    level2: 3,
  },
} as const;
