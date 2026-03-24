export type PlanIconType = "star" | "diamond" | "rocket" | "flash";

export interface PlanBenefit {
  id: string;
  text: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description?: string;
  benefits: PlanBenefit[]; // used for detailed list in create screen
  tags: string[]; // used for pills in list screen
  icon: PlanIconType;
  isActive: boolean;
  isPopular?: boolean;
  themeColor?: string; // hex color for header/background
}
