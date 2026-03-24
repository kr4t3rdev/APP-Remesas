import { colors } from "../theme";

export const getCurrencyInfo = (currencyCode: string) => {
  const code = currencyCode.toUpperCase();
  
  switch (code) {
    case "USD":
      return { flag: "🇺🇸", backgroundColor: colors.primary[500] + "15", textColor: colors.primary[600] };
    case "EUR":
      return { flag: "🇪🇺", backgroundColor: colors.success + "15", textColor: colors.success };
    case "CUP":
      return { flag: "🇨🇺", backgroundColor: colors.warning + "15", textColor: colors.warning };
    case "MXN":
      return { flag: "🇲🇽", backgroundColor: colors.danger + "15", textColor: colors.danger };
    case "GBP":
      return { flag: "🇬🇧", backgroundColor: colors.info + "15", textColor: colors.info };
    case "CAD":
      return { flag: "🇨🇦", backgroundColor: colors.danger + "15", textColor: colors.danger };
    default:
      return { flag: "💰", backgroundColor: colors.surface, textColor: colors.text.secondary };
  }
};
