type ProfileRoute = "Reports" | "BusinessWorkers";

type ProfileNavigationItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: ProfileRoute;
};

export const profileNavigationItems: readonly ProfileNavigationItem[] = [
  {
    id: "reports",
    title: "Reportes",
    subtitle: "Consultar reportes financieros",
    icon: "bar-chart-outline",
    route: "Reports",
  },
  {
    id: "workers",
    title: "Trabajadores",
    subtitle: "Gestionar trabajadores y pagos",
    icon: "people-outline",
    route: "BusinessWorkers",
  },
];
