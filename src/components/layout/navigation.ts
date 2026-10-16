export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Sidebar sections, in the design's order. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "squares-four" },
      { key: "analytics", label: "Analytics", href: "/analytics", icon: "chart-line-up" },
    ],
  },
  {
    title: "Livestock",
    items: [
      { key: "pigs", label: "Pigs", href: "/pigs", icon: "scan" },
      { key: "devices", label: "Devices", href: "/devices", icon: "broadcast" },
      { key: "gateways", label: "Gateways", href: "/gateways", icon: "wifi-high" },
    ],
  },
  {
    title: "Operations",
    items: [
      { key: "alerts", label: "Alerts", href: "/alerts", icon: "warning" },
      { key: "medical", label: "Medical Cases", href: "/medical", icon: "first-aid-kit" },
    ],
  },
  {
    title: "Administration",
    items: [
      { key: "users", label: "Users", href: "/users", icon: "users" },
      { key: "settings", label: "Settings", href: "/settings", icon: "gear-six" },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
