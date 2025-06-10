
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Contact,
  Receipt,
  Activity,
} from "lucide-react";

import { MainNavItem } from "@/types";
import { AccordionDemo } from "@/components/layout/sidebar/SidebarAccordion";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, PermissionName } from "@/hooks/usePermissions";

interface SidebarContentProps {
  isSuperAdmin?: boolean;
}

const navigation: MainNavItem[] = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "can_view_dashboard" as PermissionName,
  },
  {
    name: "Ventas",
    href: "/sales",
    icon: DollarSign,
    permission: "can_view_sales" as PermissionName,
  },
  {
    name: "Gastos",
    href: "/expenses",
    icon: ListChecks,
    permission: "can_view_expenses" as PermissionName,
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: FileText,
    permission: "can_view_reports" as PermissionName,
  },
  {
    name: "Usuarios",
    href: "/users",
    icon: Users,
    permission: "can_manage_users" as PermissionName,
  },
  {
    name: "Contactos",
    href: "/contacts",
    icon: Contact,
    permission: "can_manage_contacts" as PermissionName,
  },
  {
    name: "Bancos",
    href: "/banking",
    icon: DollarSign,
    permission: "can_view_banking" as PermissionName,
  },
  {
    name: "Facturas",
    href: "/invoices",
    icon: Receipt,
    permission: "can_view_invoices" as PermissionName,
  },
  {
    name: "Reconciliación",
    href: "/reconciliation",
    icon: Calendar,
    permission: "can_view_reconciliation" as PermissionName,
  },
  {
    name: "Monitoreo",
    href: "/monitoring",
    icon: Activity,
    permission: "can_view_dashboard" as PermissionName,
  },
];

export function SidebarContent({ isSuperAdmin }: SidebarContentProps) {
  const { isAdmin } = useAuth();
  const { canAccess } = usePermissions();

  const filteredNavigation = navigation.filter((item) => {
    if (isSuperAdmin) {
      return true;
    }

    if (item.permission) {
      return canAccess(item.permission);
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <AccordionDemo navigationItems={filteredNavigation} />
    </div>
  );
}
