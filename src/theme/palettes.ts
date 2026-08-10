type Ramp = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

type ThemeColors = {
  primary: Ramp;
  secondary: Ramp;
  accent: Ramp;
  background: string;
  card: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  success: string;
  warning: string;
  danger: string;
  info: string;
  border: string;
  separator: string;
  financial: {
    income: string;
    incomeLight: string;
    expense: string;
    expenseLight: string;
    profit: string;
    profitLight: string;
    neutral: string;
    neutralLight: string;
    compra: string;
    compraForeground: string;
    compraLight: string;
    venta: string;
    ventaForeground: string;
    ventaLight: string;
  };
  currencies: {
    usd: { primary: string; bg: string };
    eur: { primary: string; bg: string };
    mlc: { primary: string; bg: string };
    cup: { primary: string; bg: string };
  };
  dashboard: {
    bg: string;
    text: { title: string; amount: string; subtitle: string };
    categories: {
      rent: { bg: string; icon: string };
      servicios: { bg: string; icon: string };
      salario: { bg: string; icon: string };
      insumos: { bg: string; icon: string };
      otros: { bg: string; icon: string };
    };
  };
};

type ThemeGradients = {
  daily: { light: readonly [string, string]; dark: readonly [string, string] };
  profit: { light: readonly [string, string]; dark: readonly [string, string] };
  cashFlow: { light: readonly [string, string]; dark: readonly [string, string] };
  period: { light: readonly [string, string]; dark: readonly [string, string] };
  compra: { light: readonly [string, string]; dark: readonly [string, string] };
  venta: { light: readonly [string, string]; dark: readonly [string, string] };
};

type ThemeShadows = {
  sm: Record<string, unknown>;
  md: Record<string, unknown>;
  lg: Record<string, unknown>;
  glow: Record<string, unknown>;
};

export type ThemeId = "ocean" | "emerald" | "midnight" | "vault" | "gold" | "garnet";

export interface ThemePalette {
  id: ThemeId;
  name: string;
  tagline: string;
  colors: ThemeColors;
  darkColors: ThemeColors;
  gradients: ThemeGradients;
  shadows: ThemeShadows;
  darkShadows: ThemeShadows;
}

const amberLight: Ramp = {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  300: "#FCD34D",
  400: "#FBBF24",
  500: "#F59E0B",
  600: "#D97706",
  700: "#B45309",
  800: "#92400E",
  900: "#78350F",
};

const amberDark: Ramp = {
  50: "#451A03",
  100: "#78350F",
  200: "#92400E",
  300: "#B45309",
  400: "#D97706",
  500: "#F59E0B",
  600: "#FBBF24",
  700: "#FCD34D",
  800: "#FDE68A",
  900: "#FEF3C7",
};

const financialLightBase = {
  income: "#10B981",
  incomeLight: "#D1FAE5",
  expense: "#EF4444",
  expenseLight: "#FEE2E2",
  neutral: "#64748B",
  neutralLight: "#F1F5F9",
  compra: "#F59E0B",
  compraForeground: "#92400E",
  compraLight: "#FEF3C7",
  venta: "#10B981",
  ventaForeground: "#166534",
  ventaLight: "#D1FAE5",
};

const financialDarkBase = {
  income: "#10B981",
  incomeLight: "#064E3B",
  expense: "#EF4444",
  expenseLight: "#7F1D1D",
  neutral: "#94A3B8",
  neutralLight: "#334155",
  compra: "#FBBF24",
  compraForeground: "#FDE68A",
  compraLight: "#451A03",
  venta: "#34D399",
  ventaForeground: "#6EE7B7",
  ventaLight: "#064E3B",
};

const currenciesLight = {
  usd: { primary: "#22C55E", bg: "#DCFCE7" },
  eur: { primary: "#3B82F6", bg: "#DBEAFE" },
  mlc: { primary: "#8B5CF6", bg: "#EDE9FE" },
  cup: { primary: "#F59E0B", bg: "#FEF3C7" },
};

const currenciesDark = {
  usd: { primary: "#22C55E", bg: "#064E3B" },
  eur: { primary: "#60A5FA", bg: "#1E3A5F" },
  mlc: { primary: "#A78BFA", bg: "#2E1065" },
  cup: { primary: "#FBBF24", bg: "#451A03" },
};

const dashboardLight = {
  bg: "#FFFFFF",
  text: { title: "#0F172A", amount: "#0F172A", subtitle: "#64748B" },
  categories: {
    rent: { bg: "#FEE2E2", icon: "#EF4444" },
    servicios: { bg: "#DBEAFE", icon: "#3B82F6" },
    salario: { bg: "#D1FAE5", icon: "#10B981" },
    insumos: { bg: "#FEF3C7", icon: "#F59E0B" },
    otros: { bg: "#F1F5F9", icon: "#64748B" },
  },
};

const dashboardDark = {
  bg: "#1E293B",
  text: { title: "#F1F5F9", amount: "#F1F5F9", subtitle: "#94A3B8" },
  categories: {
    rent: { bg: "#7F1D1D", icon: "#FCA5A5" },
    servicios: { bg: "#1E3A5F", icon: "#93C5FD" },
    salario: { bg: "#064E3B", icon: "#6EE7B7" },
    insumos: { bg: "#451A03", icon: "#FDE68A" },
    otros: { bg: "#334155", icon: "#94A3B8" },
  },
};

const baseShadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

const darkBaseShadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: "#818CF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

const ocean = {
  id: "ocean",
  name: "Océano",
  tagline: "Liquidez y confianza",
  colors: {
    primary: {
      50: "#ECFEFF",
      100: "#CFFAFE",
      200: "#A5F3FC",
      300: "#67E8F9",
      400: "#22D3EE",
      500: "#0E7490",
      600: "#155E75",
      700: "#164E63",
      800: "#153F50",
      900: "#123442",
    },
    secondary: {
      50: "#F0FDF4",
      100: "#DCFCE7",
      200: "#BBF7D0",
      300: "#86EFAC",
      400: "#4ADE80",
      500: "#22C55E",
      600: "#16A34A",
      700: "#15803D",
      800: "#166534",
      900: "#14532D",
    },
    accent: amberLight,
    background: "#F6FAFA",
    card: "#FCFEFE",
    surface: "#EAF3F4",
    text: {
      primary: "#102A30",
      secondary: "#526C72",
      tertiary: "#526C72",
      inverse: "#FFFFFF",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#D8E7E9",
    separator: "#BDD2D5",
    financial: {
      ...financialLightBase,
      profit: "#0E7490",
      profitLight: "#CFFAFE",
    },
    currencies: currenciesLight,
    dashboard: dashboardLight,
  },
  darkColors: {
    primary: {
      50: "#082F3A",
      100: "#0C3D49",
      200: "#11505F",
      300: "#156579",
      400: "#0E7490",
      500: "#22D3EE",
      600: "#67E8F9",
      700: "#A5F3FC",
      800: "#CFFAFE",
      900: "#ECFEFF",
    },
    secondary: {
      50: "#052E16",
      100: "#14532D",
      200: "#166534",
      300: "#15803D",
      400: "#16A34A",
      500: "#22C55E",
      600: "#4ADE80",
      700: "#86EFAC",
      800: "#BBF7D0",
      900: "#DCFCE7",
    },
    accent: amberDark,
    background: "#081A1E",
    card: "#10272C",
    surface: "#18383F",
    text: {
      primary: "#EDF8F9",
      secondary: "#A3C0C5",
      tertiary: "#78989E",
      inverse: "#081A1E",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#24474E",
    separator: "#376069",
    financial: {
      ...financialDarkBase,
      profit: "#22D3EE",
      profitLight: "#0C3D49",
    },
    currencies: currenciesDark,
    dashboard: dashboardDark,
  },
  gradients: {
    daily: { light: ["#0E7490", "#155E75"], dark: ["#22D3EE", "#67E8F9"] },
    profit: { light: ["#10B981", "#059669"], dark: ["#059669", "#047857"] },
    cashFlow: { light: ["#8B5CF6", "#A855F7"], dark: ["#7C3AED", "#6D28D9"] },
    period: { light: ["#F59E0B", "#D97706"], dark: ["#D97706", "#B45309"] },
    compra: { light: ["#F59E0B", "#FCD34D"], dark: ["#D97706", "#B45309"] },
    venta: { light: ["#10B981", "#34D399"], dark: ["#059669", "#047857"] },
  },
  shadows: baseShadows,
  darkShadows: darkBaseShadows,
} as const;

const emerald = {
  id: "emerald",
  name: "Esmeralda",
  tagline: "Crecimiento y flujo",
  colors: {
    primary: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#059669",
      600: "#047857",
      700: "#065F46",
      800: "#054631",
      900: "#022C22",
    },
    secondary: {
      50: "#F0FDFA",
      100: "#CCFBF1",
      200: "#99F6E4",
      300: "#5EEAD4",
      400: "#2DD4BF",
      500: "#14B8A6",
      600: "#0D9488",
      700: "#0F766E",
      800: "#115E59",
      900: "#134E4A",
    },
    accent: {
      50: "#F7FEE7",
      100: "#ECFCCB",
      200: "#D9F99D",
      300: "#BEF264",
      400: "#A3E635",
      500: "#84CC16",
      600: "#65A30D",
      700: "#4D7C0F",
      800: "#3F6212",
      900: "#1A2E05",
    },
    background: "#F5FAF7",
    card: "#FBFEFC",
    surface: "#E5F1EC",
    text: {
      primary: "#0B1F18",
      secondary: "#475F55",
      tertiary: "#475F55",
      inverse: "#FFFFFF",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#CFE3D9",
    separator: "#AFCBC0",
    financial: {
      ...financialLightBase,
      profit: "#059669",
      profitLight: "#D1FAE5",
    },
    currencies: currenciesLight,
    dashboard: dashboardLight,
  },
  darkColors: {
    primary: {
      50: "#022C22",
      100: "#054631",
      200: "#065F46",
      300: "#047857",
      400: "#059669",
      500: "#34D399",
      600: "#6EE7B7",
      700: "#A7F3D0",
      800: "#D1FAE5",
      900: "#ECFDF5",
    },
    secondary: {
      50: "#134E4A",
      100: "#115E59",
      200: "#0F766E",
      300: "#0D9488",
      400: "#14B8A6",
      500: "#2DD4BF",
      600: "#5EEAD4",
      700: "#99F6E4",
      800: "#CCFBF1",
      900: "#F0FDFA",
    },
    accent: {
      50: "#1A2E05",
      100: "#3F6212",
      200: "#4D7C0F",
      300: "#65A30D",
      400: "#84CC16",
      500: "#A3E635",
      600: "#BEF264",
      700: "#D9F99D",
      800: "#ECFCCB",
      900: "#F7FEE7",
    },
    background: "#04150F",
    card: "#0A241B",
    surface: "#123528",
    text: {
      primary: "#E9F7F0",
      secondary: "#A6C9B9",
      tertiary: "#7FA394",
      inverse: "#04150F",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#1D4636",
    separator: "#2F6650",
    financial: {
      ...financialDarkBase,
      profit: "#34D399",
      profitLight: "#054631",
    },
    currencies: currenciesDark,
    dashboard: dashboardDark,
  },
  gradients: {
    daily: { light: ["#059669", "#047857"], dark: ["#34D399", "#6EE7B7"] },
    profit: { light: ["#10B981", "#059669"], dark: ["#059669", "#047857"] },
    cashFlow: { light: ["#14B8A6", "#0D9488"], dark: ["#2DD4BF", "#5EEAD4"] },
    period: { light: ["#84CC16", "#65A30D"], dark: ["#A3E635", "#BEF264"] },
    compra: { light: ["#F59E0B", "#FCD34D"], dark: ["#D97706", "#B45309"] },
    venta: { light: ["#10B981", "#34D399"], dark: ["#059669", "#047857"] },
  },
  shadows: baseShadows,
  darkShadows: darkBaseShadows,
} as const;

const midnight = {
  id: "midnight",
  name: "Medianoche",
  tagline: "Banca y seguridad",
  colors: {
    primary: {
      50: "#EEF2FF",
      100: "#E0E7FF",
      200: "#C7D2FE",
      300: "#A5B4FC",
      400: "#818CF8",
      500: "#4F46E5",
      600: "#4338CA",
      700: "#3730A3",
      800: "#312E81",
      900: "#1E1B4B",
    },
    secondary: {
      50: "#F0F9FF",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      400: "#38BDF8",
      500: "#0284C7",
      600: "#0369A1",
      700: "#075985",
      800: "#0C4A6E",
      900: "#082F49",
    },
    accent: amberLight,
    background: "#F5F7FC",
    card: "#FDFEFF",
    surface: "#E9EEF8",
    text: {
      primary: "#111A33",
      secondary: "#4A5874",
      tertiary: "#4A5874",
      inverse: "#FFFFFF",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#D5DEEB",
    separator: "#B3C2D6",
    financial: {
      ...financialLightBase,
      profit: "#4F46E5",
      profitLight: "#E0E7FF",
    },
    currencies: currenciesLight,
    dashboard: dashboardLight,
  },
  darkColors: {
    primary: {
      50: "#1E1B4B",
      100: "#312E81",
      200: "#3730A3",
      300: "#4338CA",
      400: "#4F46E5",
      500: "#818CF8",
      600: "#A5B4FC",
      700: "#C7D2FE",
      800: "#E0E7FF",
      900: "#EEF2FF",
    },
    secondary: {
      50: "#082F49",
      100: "#0C4A6E",
      200: "#075985",
      300: "#0369A1",
      400: "#0284C7",
      500: "#38BDF8",
      600: "#7DD3FC",
      700: "#BAE6FD",
      800: "#E0F2FE",
      900: "#F0F9FF",
    },
    accent: amberDark,
    background: "#0B1020",
    card: "#141B31",
    surface: "#1E2742",
    text: {
      primary: "#EEF1FA",
      secondary: "#A8B3CE",
      tertiary: "#7E8BA8",
      inverse: "#0B1020",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#26314F",
    separator: "#38446B",
    financial: {
      ...financialDarkBase,
      profit: "#818CF8",
      profitLight: "#312E81",
    },
    currencies: currenciesDark,
    dashboard: dashboardDark,
  },
  gradients: {
    daily: { light: ["#4F46E5", "#4338CA"], dark: ["#818CF8", "#A5B4FC"] },
    profit: { light: ["#10B981", "#059669"], dark: ["#059669", "#047857"] },
    cashFlow: { light: ["#0284C7", "#0369A1"], dark: ["#38BDF8", "#7DD3FC"] },
    period: { light: ["#F59E0B", "#D97706"], dark: ["#D97706", "#B45309"] },
    compra: { light: ["#F59E0B", "#FCD34D"], dark: ["#D97706", "#B45309"] },
    venta: { light: ["#10B981", "#34D399"], dark: ["#059669", "#047857"] },
  },
  shadows: baseShadows,
  darkShadows: darkBaseShadows,
} as const;

const vault = {
  id: "vault",
  name: "Bóveda",
  tagline: "Premium y atrevido",
  colors: {
    primary: {
      50: "#F5F3FF",
      100: "#EDE9FE",
      200: "#DDD6FE",
      300: "#C4B5FD",
      400: "#A78BFA",
      500: "#7C3AED",
      600: "#6D28D9",
      700: "#5B21B6",
      800: "#4C1D95",
      900: "#3B0764",
    },
    secondary: {
      50: "#FDF4FF",
      100: "#FAE8FF",
      200: "#F5D0FE",
      300: "#F0ABFC",
      400: "#E879F9",
      500: "#C026D3",
      600: "#A21CAF",
      700: "#86198F",
      800: "#701A75",
      900: "#4A044E",
    },
    accent: amberLight,
    background: "#F7F5FD",
    card: "#FEFDFF",
    surface: "#EBE8F8",
    text: {
      primary: "#1D1433",
      secondary: "#5A4F75",
      tertiary: "#5A4F75",
      inverse: "#FFFFFF",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#D9D3EA",
    separator: "#C0B8D8",
    financial: {
      ...financialLightBase,
      profit: "#7C3AED",
      profitLight: "#EDE9FE",
    },
    currencies: currenciesLight,
    dashboard: dashboardLight,
  },
  darkColors: {
    primary: {
      50: "#3B0764",
      100: "#4C1D95",
      200: "#5B21B6",
      300: "#6D28D9",
      400: "#7C3AED",
      500: "#A78BFA",
      600: "#C4B5FD",
      700: "#DDD6FE",
      800: "#EDE9FE",
      900: "#F5F3FF",
    },
    secondary: {
      50: "#4A044E",
      100: "#701A75",
      200: "#86198F",
      300: "#A21CAF",
      400: "#C026D3",
      500: "#E879F9",
      600: "#F0ABFC",
      700: "#F5D0FE",
      800: "#FAE8FF",
      900: "#FDF4FF",
    },
    accent: amberDark,
    background: "#130A26",
    card: "#1D1138",
    surface: "#281851",
    text: {
      primary: "#F4F0FB",
      secondary: "#B4A8D4",
      tertiary: "#8A7BB0",
      inverse: "#130A26",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#322653",
    separator: "#4A3A78",
    financial: {
      ...financialDarkBase,
      profit: "#A78BFA",
      profitLight: "#4C1D95",
    },
    currencies: currenciesDark,
    dashboard: dashboardDark,
  },
  gradients: {
    daily: { light: ["#7C3AED", "#6D28D9"], dark: ["#A78BFA", "#C4B5FD"] },
    profit: { light: ["#10B981", "#059669"], dark: ["#059669", "#047857"] },
    cashFlow: { light: ["#C026D3", "#A21CAF"], dark: ["#E879F9", "#F0ABFC"] },
    period: { light: ["#F59E0B", "#D97706"], dark: ["#D97706", "#B45309"] },
    compra: { light: ["#F59E0B", "#FCD34D"], dark: ["#D97706", "#B45309"] },
    venta: { light: ["#10B981", "#34D399"], dark: ["#059669", "#047857"] },
  },
  shadows: baseShadows,
  darkShadows: darkBaseShadows,
} as const;

const gold = {
  id: "gold",
  name: "Oro",
  tagline: "Riqueza y calidez",
  colors: {
    primary: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#B45309",
      600: "#92400E",
      700: "#78350F",
      800: "#663C0A",
      900: "#451A03",
    },
    secondary: {
      50: "#FFF7ED",
      100: "#FFEDD5",
      200: "#FED7AA",
      300: "#FDBA74",
      400: "#FB923C",
      500: "#C2410C",
      600: "#9A3412",
      700: "#7C2D12",
      800: "#6B2510",
      900: "#431407",
    },
    accent: {
      50: "#FEFCE8",
      100: "#FEF9C3",
      200: "#FEF08A",
      300: "#FDE047",
      400: "#FACC15",
      500: "#CA8A04",
      600: "#A16207",
      700: "#854D0E",
      800: "#713F12",
      900: "#422006",
    },
    background: "#FDFAF2",
    card: "#FFFDF7",
    surface: "#F5EDDC",
    text: {
      primary: "#271C09",
      secondary: "#6E5C36",
      tertiary: "#6E5C36",
      inverse: "#FFFFFF",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#EAE0C8",
    separator: "#D6C7A4",
    financial: {
      ...financialLightBase,
      profit: "#B45309",
      profitLight: "#FEF3C7",
    },
    currencies: currenciesLight,
    dashboard: dashboardLight,
  },
  darkColors: {
    primary: {
      50: "#451A03",
      100: "#663C0A",
      200: "#78350F",
      300: "#92400E",
      400: "#B45309",
      500: "#FBBF24",
      600: "#FCD34D",
      700: "#FDE68A",
      800: "#FEF3C7",
      900: "#FFFBEB",
    },
    secondary: {
      50: "#431407",
      100: "#6B2510",
      200: "#7C2D12",
      300: "#9A3412",
      400: "#C2410C",
      500: "#FB923C",
      600: "#FDBA74",
      700: "#FED7AA",
      800: "#FFEDD5",
      900: "#FFF7ED",
    },
    accent: {
      50: "#422006",
      100: "#713F12",
      200: "#854D0E",
      300: "#A16207",
      400: "#CA8A04",
      500: "#FACC15",
      600: "#FDE047",
      700: "#FEF08A",
      800: "#FEF9C3",
      900: "#FEFCE8",
    },
    background: "#1A1206",
    card: "#241A0B",
    surface: "#322614",
    text: {
      primary: "#FBF4E4",
      secondary: "#CFBE92",
      tertiary: "#A18E60",
      inverse: "#1A1206",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#4A3A1C",
    separator: "#6B552A",
    financial: {
      ...financialDarkBase,
      profit: "#FBBF24",
      profitLight: "#663C0A",
    },
    currencies: currenciesDark,
    dashboard: dashboardDark,
  },
  gradients: {
    daily: { light: ["#B45309", "#92400E"], dark: ["#FBBF24", "#FCD34D"] },
    profit: { light: ["#10B981", "#059669"], dark: ["#059669", "#047857"] },
    cashFlow: { light: ["#C2410C", "#9A3412"], dark: ["#FB923C", "#FDBA74"] },
    period: { light: ["#CA8A04", "#A16207"], dark: ["#FACC15", "#FDE047"] },
    compra: { light: ["#F59E0B", "#FCD34D"], dark: ["#D97706", "#B45309"] },
    venta: { light: ["#10B981", "#34D399"], dark: ["#059669", "#047857"] },
  },
  shadows: baseShadows,
  darkShadows: darkBaseShadows,
} as const;

const garnet = {
  id: "garnet",
  name: "Granate",
  tagline: "Audaz y enérgico",
  colors: {
    primary: {
      50: "#FFF1F2",
      100: "#FFE4E6",
      200: "#FECDD3",
      300: "#FDA4AF",
      400: "#FB7185",
      500: "#BE123C",
      600: "#9F1239",
      700: "#881337",
      800: "#7F0E2F",
      900: "#4C0519",
    },
    secondary: {
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#DC2626",
      600: "#B91C1C",
      700: "#991B1B",
      800: "#7F1D1D",
      900: "#450A0A",
    },
    accent: amberLight,
    background: "#FDF5F6",
    card: "#FFFCFD",
    surface: "#F7E9EB",
    text: {
      primary: "#2B0F17",
      secondary: "#6B3D47",
      tertiary: "#6B3D47",
      inverse: "#FFFFFF",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#F0D6DA",
    separator: "#DFBCC3",
    financial: {
      ...financialLightBase,
      profit: "#BE123C",
      profitLight: "#FFE4E6",
    },
    currencies: currenciesLight,
    dashboard: dashboardLight,
  },
  darkColors: {
    primary: {
      50: "#4C0519",
      100: "#7F0E2F",
      200: "#881337",
      300: "#9F1239",
      400: "#BE123C",
      500: "#FB7185",
      600: "#FDA4AF",
      700: "#FECDD3",
      800: "#FFE4E6",
      900: "#FFF1F2",
    },
    secondary: {
      50: "#450A0A",
      100: "#7F1D1D",
      200: "#991B1B",
      300: "#B91C1C",
      400: "#DC2626",
      500: "#F87171",
      600: "#FCA5A5",
      700: "#FECACA",
      800: "#FEE2E2",
      900: "#FEF2F2",
    },
    accent: amberDark,
    background: "#1C080E",
    card: "#2A0F18",
    surface: "#3A1622",
    text: {
      primary: "#FBF0F2",
      secondary: "#CEA0AC",
      tertiary: "#A06C7B",
      inverse: "#1C080E",
    },
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    border: "#4A2030",
    separator: "#6E3348",
    financial: {
      ...financialDarkBase,
      profit: "#FB7185",
      profitLight: "#7F0E2F",
    },
    currencies: currenciesDark,
    dashboard: dashboardDark,
  },
  gradients: {
    daily: { light: ["#BE123C", "#9F1239"], dark: ["#FB7185", "#FDA4AF"] },
    profit: { light: ["#10B981", "#059669"], dark: ["#059669", "#047857"] },
    cashFlow: { light: ["#8B5CF6", "#7C3AED"], dark: ["#A78BFA", "#C4B5FD"] },
    period: { light: ["#F59E0B", "#D97706"], dark: ["#D97706", "#B45309"] },
    compra: { light: ["#F59E0B", "#FCD34D"], dark: ["#D97706", "#B45309"] },
    venta: { light: ["#10B981", "#34D399"], dark: ["#059669", "#047857"] },
  },
  shadows: baseShadows,
  darkShadows: darkBaseShadows,
} as const;

export const THEMES: Record<ThemeId, ThemePalette> = {
  ocean,
  emerald,
  midnight,
  vault,
  gold,
  garnet,
};

export const THEME_LIST: ThemePalette[] = [
  ocean,
  emerald,
  midnight,
  vault,
  gold,
  garnet,
];
