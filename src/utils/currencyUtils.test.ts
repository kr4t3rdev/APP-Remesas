import { getCountryCode, getCurrencySymbol } from "./currencyUtils";

describe("unknown currency identity", () => {
  it("does not invent a country or dollar symbol", () => {
    expect(getCountryCode("XYZ")).toBeNull();
    expect(getCurrencySymbol("XYZ")).toBe("XYZ");
    expect(getCurrencySymbol("")).toBe("");
  });
});

describe("Zelle (ZLL)", () => {
  it("maps to the US country code and dollar symbol", () => {
    expect(getCountryCode("ZLL")).toBe("US");
    expect(getCurrencySymbol("ZLL")).toBe("$");
  });
});
