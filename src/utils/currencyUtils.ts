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
  
  if (currencyCode.length === 3) {
    return currencyCode.substring(0, 2).toUpperCase();
  }
  
  return null;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  if (!currencyCode) return "$";

  const symbolMap: Record<string, string> = {
    USD: "$", EUR: "€", CUP: "$", MLC: "$", GBP: "£",
    CAD: "$", MXN: "$", COP: "$", ARS: "$", BRL: "R$",
    CLP: "$", PEN: "S/", JPY: "¥", CNY: "¥", AUD: "$",
    CHF: "Fr", RUB: "₽", INR: "₹", KRW: "₩", NZD: "$",
    ZAR: "R", TRY: "₺", SEK: "kr",
  };

  return symbolMap[currencyCode.toUpperCase()] || "$";
};
