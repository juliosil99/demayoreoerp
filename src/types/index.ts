
import { PermissionName } from "@/hooks/usePermissions";

export interface MainNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionName;
}

export interface SidebarContentProps {
  isSuperAdmin?: boolean;
}
