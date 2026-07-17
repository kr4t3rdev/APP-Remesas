import { mainTabDefinitions } from "./mainTabsConfig";

describe("mainTabDefinitions", () => {
  it("defines the requested navigation order", () => {
    expect(mainTabDefinitions.map(({ route, label, icon }) => ({ route, label, icon }))).toEqual([
      { route: "Home", label: "Inicio", icon: "home" },
      { route: "Transactions", label: "Transacciones", icon: "swap-horizontal" },
      { route: "Cash", label: "Caja", icon: "wallet" },
      { route: "Expenses", label: "Gastos", icon: "receipt" },
      { route: "Profile", label: "Perfil", icon: "person" },
    ]);
  });

  it("only emphasizes the central Cash tab", () => {
    expect(mainTabDefinitions.filter(({ emphasized }) => emphasized)).toEqual([
      expect.objectContaining({ route: "Cash" }),
    ]);
  });

  it("does not expose Business or Reports as primary tabs", () => {
    const routes = mainTabDefinitions.map(({ route }) => route);

    expect(routes).not.toContain("Business");
    expect(routes).not.toContain("Reports");
  });
});
