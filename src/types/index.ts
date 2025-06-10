
export interface MainNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

export interface SidebarContentProps {
  isSuperAdmin?: boolean;
}
