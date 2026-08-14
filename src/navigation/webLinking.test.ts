import { webLinking } from "./webLinking";

describe("web navigation linking", () => {
  it("keeps public auth routes addressable", () => {
    const screens = webLinking.config!.screens as Record<string, unknown>;
    expect(screens.Welcome).toBe("/");
    expect(screens.Login).toBe("login");
    expect(screens.Register).toBe("register");
  });

  it("exposes separate user and admin workspace paths", () => {
    const main = (webLinking.config!.screens as Record<string, any>).Main.screens;
    expect(main.Home).toBe("app");
    expect(main.Cash).toBe("app/caja");
    expect(main.AdminHome).toBe("admin");
    expect(main.AdminUsers).toBe("admin/usuarios");
    const adminServices = main.AdminServices as Record<string, any>;
    expect(adminServices.path).toBe("admin/servicios");
    expect(adminServices.screens.AdminPlansList).toBe("planes");
    expect(adminServices.screens.AdminPlanCreate).toBe("planes/nuevo");
  });
});
