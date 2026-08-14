import { colors } from "../theme";

const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const alpha08 = (hex: string) => hexToRgba(hex, 0.08);

type CurrencyInfo = {
  flag: string;
  backgroundColor: string;
  textColor: string;
};

const currencyInfoMap: Record<string, CurrencyInfo> = {
  USD: { flag: "🇺🇸", backgroundColor: alpha08(colors.primary[500]), textColor: colors.primary[600] },
  ZLL: { flag: "🇺🇸", backgroundColor: alpha08(colors.primary[500]), textColor: colors.primary[600] },
  EUR: { flag: "🇪🇺", backgroundColor: alpha08(colors.success), textColor: colors.success },
  CUP: { flag: "🇨🇺", backgroundColor: alpha08(colors.warning), textColor: colors.warning },
  MLC: { flag: "🇨🇺", backgroundColor: alpha08(colors.warning), textColor: colors.warning },
  MXN: { flag: "🇲🇽", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  GBP: { flag: "🇬🇧", backgroundColor: alpha08(colors.info), textColor: colors.info },
  CAD: { flag: "🇨🇦", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  COP: { flag: "🇨🇴", backgroundColor: alpha08(colors.primary[500]), textColor: colors.primary[600] },
  ARS: { flag: "🇦🇷", backgroundColor: alpha08(colors.info), textColor: colors.info },
  BRL: { flag: "🇧🇷", backgroundColor: alpha08(colors.success), textColor: colors.success },
  CLP: { flag: "🇨🇱", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  PEN: { flag: "🇵🇪", backgroundColor: alpha08(colors.warning), textColor: colors.warning },
  JPY: { flag: "🇯🇵", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  CNY: { flag: "🇨🇳", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  AUD: { flag: "🇦🇺", backgroundColor: alpha08(colors.primary[500]), textColor: colors.primary[600] },
  CHF: { flag: "🇨🇭", backgroundColor: alpha08(colors.info), textColor: colors.info },
  RUB: { flag: "🇷🇺", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  INR: { flag: "🇮🇳", backgroundColor: alpha08(colors.warning), textColor: colors.warning },
  KRW: { flag: "🇰🇷", backgroundColor: alpha08(colors.primary[500]), textColor: colors.primary[600] },
  NZD: { flag: "🇳🇿", backgroundColor: alpha08(colors.info), textColor: colors.info },
  ZAR: { flag: "🇿🇦", backgroundColor: alpha08(colors.success), textColor: colors.success },
  TRY: { flag: "🇹🇷", backgroundColor: alpha08(colors.danger), textColor: colors.danger },
  SEK: { flag: "🇸🇪", backgroundColor: alpha08(colors.info), textColor: colors.info },
};

export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  return currencyInfoMap[currencyCode.toUpperCase()] ?? {
    flag: "💰",
    backgroundColor: colors.surface,
    textColor: colors.text.secondary,
  };
};
