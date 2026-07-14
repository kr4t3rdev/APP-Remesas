import { profileNavigationItems } from "./profileNavigationItems";

describe("profileNavigationItems", () => {
  it("exposes Workers from Profile with the registered route", () => {
    expect(profileNavigationItems).toContainEqual({
      id: "workers",
      title: "Trabajadores",
      subtitle: "Gestionar trabajadores y pagos",
      icon: "people-outline",
      route: "BusinessWorkers",
    });
  });
});
