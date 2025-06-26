
import {
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LucideIcon,
  Receipt,
} from "lucide-react";

export type SidebarItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  badge?: string;
  requiresAdmin?: boolean;
  requiresPermission?: string;
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
};

export const sidebarGroups: SidebarGroup[] = [
  {
    title: "Getting Started",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    title: "Contabilidad",
    defaultOpen: true,
    items: [
      {
        name: "Gastos",
        href: "/expenses",
        icon: Receipt,
        requiresPermission: "can_view_expenses"
      },
      {
        name: "Conciliación",
        href: "/reconciliation",
        icon: Calculator,
        requiresPermission: "can_view_reconciliation"
      },
      {
        name: "Lotes de Reconciliación",
        href: "/reconciliation-batches",
        icon: FileText,
        requiresPermission: "can_view_reconciliation"
      },
      {
        name: "Facturas",
        href: "/invoices",
        icon: FileText,
        requiresPermission: "can_view_invoices"
      },
      {
        name: "Cuentas por Pagar",
        href: "/payables",
        icon: CreditCard,
        requiresPermission: "can_view_expenses"
      },
      {
        name: "Catálogo de Cuentas",
        href: "/chart-of-accounts",
        icon: BookOpen,
        requiresPermission: "can_view_reports"
      },
      {
        name: "Reportes",
        href: "/reports",
        icon: BookOpen,
        requiresPermission: "can_view_reports"
      }
    ]
  }
];
