import { THEMES, THEME_LIST } from "./palettes";
import type { ThemeId } from "./palettes";

const REQUIRED_TOP_LEVEL = [
  "primary",
  "secondary",
  "accent",
  "background",
  "card",
  "surface",
  "text",
  "success",
  "warning",
  "danger",
  "info",
  "border",
  "separator",
  "financial",
  "currencies",
  "dashboard",
] as const;

const REQUIRED_FINANCIAL = [
  "income",
  "incomeLight",
  "expense",
  "expenseLight",
  "profit",
  "profitLight",
  "neutral",
  "neutralLight",
  "compra",
  "compraForeground",
  "compraLight",
  "venta",
  "ventaForeground",
  "ventaLight",
] as const;

const REQUIRED_GRADIENTS = [
  "daily",
  "profit",
  "cashFlow",
  "period",
  "compra",
  "venta",
] as const;

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function assertHex(value: unknown, label: string) {
  expect({ label, value }).toEqual({ label, value: expect.any(String) });
  expect(value).toMatch(HEX_RE);
}

describe("theme palettes", () => {
  it("registers exactly the six intended themes", () => {
    expect(THEME_LIST).toHaveLength(6);
    expect(THEME_LIST.map((t) => t.id)).toEqual([
      "ocean",
      "emerald",
      "midnight",
      "vault",
      "gold",
      "garnet",
    ]);
    for (const id of Object.keys(THEMES) as ThemeId[]) {
      expect(THEMES[id].id).toBe(id);
    }
  });

  it("keeps the full color contract in light and dark variants", () => {
    for (const theme of THEME_LIST) {
      for (const variant of ["colors", "darkColors"] as const) {
        const palette = theme[variant];

        for (const key of REQUIRED_TOP_LEVEL) {
          expect(palette[key]).toBeDefined();
        }

        for (const rampKey of ["primary", "secondary", "accent"] as const) {
          for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const) {
            assertHex(palette[rampKey][step], `${theme.id}.${variant}.${rampKey}.${step}`);
          }
        }

        for (const key of [
          "background",
          "card",
          "surface",
          "success",
          "warning",
          "danger",
          "info",
          "border",
          "separator",
        ] as const) {
          assertHex(palette[key], `${theme.id}.${variant}.${key}`);
        }

        for (const key of ["primary", "secondary", "tertiary", "inverse"] as const) {
          assertHex(palette.text[key], `${theme.id}.${variant}.text.${key}`);
        }

        for (const key of REQUIRED_FINANCIAL) {
          assertHex(palette.financial[key], `${theme.id}.${variant}.financial.${key}`);
        }

        for (const currency of ["usd", "eur", "mlc", "cup"] as const) {
          assertHex(palette.currencies[currency].primary, `${theme.id}.${variant}.currencies.${currency}`);
          assertHex(palette.currencies[currency].bg, `${theme.id}.${variant}.currencies.${currency}`);
        }
      }
    }
  });

  it("provides light and dark gradients for every chart key", () => {
    for (const theme of THEME_LIST) {
      for (const key of REQUIRED_GRADIENTS) {
        const gradient = theme.gradients[key];
        expect(gradient.light).toHaveLength(2);
        expect(gradient.dark).toHaveLength(2);
        for (const color of [...gradient.light, ...gradient.dark]) {
          assertHex(color, `${theme.id}.gradients.${key}`);
        }
      }
    }
  });

  it("offers readable foreground contrast for its primary accent", () => {
    const luminance = (hex: string) => {
      const values = hex
        .slice(1)
        .match(/.{2}/g)!
        .map((v) => parseInt(v, 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    };
    const contrast = (a: string, b: string) => {
      const l1 = luminance(a);
      const l2 = luminance(b);
      const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
      return (hi + 0.05) / (lo + 0.05);
    };

    for (const theme of THEME_LIST) {
      const light = contrast(theme.colors.text.primary, theme.colors.background);
      const dark = contrast(theme.darkColors.text.primary, theme.darkColors.background);
      expect([theme.id, "light", light.toFixed(2)]).toEqual([
        theme.id,
        "light",
        expect.any(String),
      ]);
      expect(light).toBeGreaterThanOrEqual(4.5);
      expect(dark).toBeGreaterThanOrEqual(4.5);
    }
  });
});
