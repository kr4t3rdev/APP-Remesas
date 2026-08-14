import type { LinkingOptions } from "@react-navigation/native";

export const webLinking: LinkingOptions<any> = {
  prefixes: ["/"],
  config: {
    screens: {
      Welcome: "/",
      Login: "login",
      Register: "register",
      VerificationPending: "verification-pending",
      ChangePassword: "cambiar-contrasena",
      Main: {
        screens: {
          Home: "app",
          Transactions: "app/transacciones",
          Cash: "app/caja",
          Expenses: "app/gastos",
          Profile: "app/perfil",
          Reports: "app/reportes",
          Objectives: "app/objetivos",
          AdminHome: "admin",
          AdminServices: {
            path: "admin/servicios",
            screens: {
              AdminServicesList: "",
              AdminPlansList: "planes",
              AdminPlanCreate: "planes/nuevo",
            },
          },
          AdminUsers: "admin/usuarios",
          AdminReports: "admin/reportes",
          AdminProfile: "admin/perfil",
        },
      },
      AdminUserDetail: "admin/usuarios/:userId",
      AdminLicensesList: "admin/licencias",
      AdminLicenseDetail: "admin/licencias/:licenseId",
      AdminAuditLog: "admin/auditoria",
      AdminExportReports: "admin/exportar-reportes",
      BusinessWorkers: "app/trabajadores",
      CashHistory: "app/caja/historial",
      ExchangeRates: "app/tasas",
      BankAccounts: "app/cuentas",
      Currencies: "app/monedas",
    },
  },
};
