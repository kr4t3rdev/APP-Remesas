import fs from "fs";
import path from "path";

const profileFeatureScreens = [
  "../reports/ReportsScreen.tsx",
  "../worker-payments/WorkerPaymentsScreen.tsx",
  "../exchange-rates/ExchangeRatesScreen.tsx",
  "../currencies/CurrenciesScreen.tsx",
  "../bank-accounts/BankAccountsScreen.tsx",
] as const;

describe("Profile feature navigation", () => {
  it.each(profileFeatureScreens)("shows a back button in %s", (relativePath) => {
    const source = fs.readFileSync(path.resolve(__dirname, relativePath), "utf8");

    expect(source).toContain("<ProfileFeatureBackButton");
  });
});
