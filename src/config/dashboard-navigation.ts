import {
  LayoutDashboard,
  Sparkles,
  Film,
  Images,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNavigation: readonly DashboardNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create",
    href: "/create",
    icon: Sparkles,
  },
  {
    title: "Generations",
    href: "/generations",
    icon: Film,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: Images,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;
