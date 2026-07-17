const fs = require("fs") as {
  readFileSync: (path: string, encoding: "utf8") => string;
};

const screens = [
  ["Home", "home/HomeScreen.tsx", "ScrollView"],
  ["Transactions", "transactions/TransactionsScreen.tsx", "FlatList"],
  ["Cash", "cash/CashScreen.tsx", "ScrollView"],
  ["Expenses", "expenses/ExpensesScreen.tsx", "FlatList"],
  ["Profile", "profile/ProfileScreen.tsx", "ScrollView"],
] as const;

describe("tab bar screen integrations", () => {
  it.each(screens)("connects %s to scroll motion and repeated-tab scroll-to-top", (route, file, list) => {
    const source = fs.readFileSync(`src/screens/${file}`, "utf8");

    expect(source).toContain("useTabBarScrollBehavior");
    expect(source).toContain(`useTabScrollToTop("${route}"`);
    expect(source).toMatch(new RegExp(`const .*Ref = useRef<${list}`));
    expect(source).toContain("{...tabBarScrollBehavior}");
  });
});
