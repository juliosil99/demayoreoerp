
import { PermissionName } from "@/hooks/usePermissions";
import { type LucideIcon } from "lucide-react";

export interface MainNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionName;
}

export interface SidebarContentProps {
  isSuperAdmin?: boolean;
}
