export const getCountryCode = (currencyCode: string): string | null => {
  if (!currencyCode) return null;
  
  const codeMap: Record<string, string> = {
    USD: "US", EUR: "EU", CUP: "CU", MLC: "CU", GBP: "GB",
    CAD: "CA", MXN: "MX", COP: "CO", ARS: "AR", BRL: "BR",
    CLP: "CL", PEN: "PE", JPY: "JP", CNY: "CN", AUD: "AU",
    CHF: "CH", RUB: "RU", INR: "IN", KRW: "KR", NZD: "NZ",
    ZAR: "ZA", TRY: "TR", SEK: "SE",
  };
  
  const code = codeMap[currencyCode.toUpperCase()];
  if (code) return code;
  
  return null;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  if (!currencyCode) return "";

  const symbolMap: Record<string, string> = {
    USD: "$", EUR: "€", CUP: "CUP", MLC: "MLC", GBP: "£",
    CAD: "CAD$", MXN: "MXN$", COP: "COP$", ARS: "ARS$", BRL: "R$",
    CLP: "CLP$", PEN: "S/", JPY: "¥", CNY: "¥", AUD: "AUD$",
    CHF: "Fr", RUB: "₽", INR: "₹", KRW: "₩", NZD: "NZD$",
    ZAR: "R", TRY: "₺", SEK: "kr",
  };

  return symbolMap[currencyCode.toUpperCase()] || currencyCode.toUpperCase();
};
