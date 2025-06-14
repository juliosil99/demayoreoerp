
import { LucideIcon } from "lucide-react";
import { PermissionName } from "@/hooks/usePermissions";

export interface MainNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionName;
}

export interface SidebarGroupType {
  title: string;
  items: MainNavItem[];
  defaultOpen?: boolean;
}

export interface SidebarContentProps {
  isSuperAdmin?: boolean;
}
