import { colors } from "../theme";

type CurrencyInfo = {
  flag: string;
  backgroundColor: string;
  textColor: string;
};

const currencyInfoMap: Record<string, CurrencyInfo> = {
  USD: { flag: "🇺🇸", backgroundColor: colors.primary[500] + "15", textColor: colors.primary[600] },
  EUR: { flag: "🇪🇺", backgroundColor: colors.success + "15", textColor: colors.success },
  CUP: { flag: "🇨🇺", backgroundColor: colors.warning + "15", textColor: colors.warning },
  MLC: { flag: "🇨🇺", backgroundColor: colors.warning + "15", textColor: colors.warning },
  MXN: { flag: "🇲🇽", backgroundColor: colors.danger + "15", textColor: colors.danger },
  MEX: { flag: "🇲🇽", backgroundColor: colors.danger + "15", textColor: colors.danger },
  GBP: { flag: "🇬🇧", backgroundColor: colors.info + "15", textColor: colors.info },
  CAD: { flag: "🇨🇦", backgroundColor: colors.danger + "15", textColor: colors.danger },
  COP: { flag: "🇨🇴", backgroundColor: colors.primary[500] + "15", textColor: colors.primary[600] },
  ARS: { flag: "🇦🇷", backgroundColor: colors.info + "15", textColor: colors.info },
  BRL: { flag: "🇧🇷", backgroundColor: colors.success + "15", textColor: colors.success },
  CLP: { flag: "🇨🇱", backgroundColor: colors.danger + "15", textColor: colors.danger },
  PEN: { flag: "🇵🇪", backgroundColor: colors.warning + "15", textColor: colors.warning },
  JPY: { flag: "🇯🇵", backgroundColor: colors.danger + "15", textColor: colors.danger },
  CNY: { flag: "🇨🇳", backgroundColor: colors.danger + "15", textColor: colors.danger },
  AUD: { flag: "🇦🇺", backgroundColor: colors.primary[500] + "15", textColor: colors.primary[600] },
  CHF: { flag: "🇨🇭", backgroundColor: colors.info + "15", textColor: colors.info },
  RUB: { flag: "🇷🇺", backgroundColor: colors.danger + "15", textColor: colors.danger },
  INR: { flag: "🇮🇳", backgroundColor: colors.warning + "15", textColor: colors.warning },
  KRW: { flag: "🇰🇷", backgroundColor: colors.primary[500] + "15", textColor: colors.primary[600] },
  NZD: { flag: "🇳🇿", backgroundColor: colors.info + "15", textColor: colors.info },
  ZAR: { flag: "🇿🇦", backgroundColor: colors.success + "15", textColor: colors.success },
  TRY: { flag: "🇹🇷", backgroundColor: colors.danger + "15", textColor: colors.danger },
  SEK: { flag: "🇸🇪", backgroundColor: colors.info + "15", textColor: colors.info },
};

export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  return currencyInfoMap[currencyCode.toUpperCase()] ?? {
    flag: "💰",
    backgroundColor: colors.surface,
    textColor: colors.text.secondary,
  };
};
