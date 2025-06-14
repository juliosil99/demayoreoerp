
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
  Building2,
  CreditCard,
  ArrowLeftRight,
  Calculator,
  TrendingUp,
  Search,
  Settings,
  ShoppingCart,
  Banknote,
  MessageSquare,
} from "lucide-react";

import { SidebarGroupType } from "./types";
import { PermissionName } from "@/hooks/usePermissions";

export const sidebarGroups: SidebarGroupType[] = [
  {
    title: "Principal",
    items: [
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
    ],
    defaultOpen: true,
  },
  {
    title: "Ventas",
    items: [
      {
        name: "Ventas",
        href: "/sales",
        icon: DollarSign,
        permission: "can_view_sales" as PermissionName,
      },
      {
        name: "Pagos",
        href: "/sales/payments",
        icon: Banknote,
        permission: "can_view_sales" as PermissionName,
      },
    ],
  },
  {
    title: "Facturas",
    items: [
      {
        name: "Facturas",
        href: "/sales/invoices",
        icon: Receipt,
        permission: "can_view_invoices" as PermissionName,
      },
      {
        name: "Búsqueda de Productos",
        href: "/product-search",
        icon: Search,
        permission: "can_view_invoices" as PermissionName,
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        name: "Gastos",
        href: "/expenses",
        icon: ListChecks,
        permission: "can_view_expenses" as PermissionName,
      },
      {
        name: "Reconciliación",
        href: "/expenses/reconciliation",
        icon: Calendar,
        permission: "can_view_reconciliation" as PermissionName,
      },
      {
        name: "Por Cobrar",
        href: "/expenses/receivables",
        icon: TrendingUp,
        permission: "can_view_expenses" as PermissionName,
      },
      {
        name: "Por Pagar",
        href: "/expenses/payables",
        icon: ListChecks,
        permission: "can_view_expenses" as PermissionName,
      },
      {
        name: "Bancos",
        href: "/accounting/banking",
        icon: CreditCard,
        permission: "can_view_banking" as PermissionName,
      },
      {
        name: "Transferencias",
        href: "/accounting/transfers",
        icon: ArrowLeftRight,
        permission: "can_manage_banking" as PermissionName,
      },
      {
        name: "Catálogo de Cuentas",
        href: "/accounting/chart-of-accounts",
        icon: Calculator,
        permission: "can_view_reports" as PermissionName,
      },
      {
        name: "Reportes",
        href: "/accounting/reports",
        icon: FileText,
        permission: "can_view_reports" as PermissionName,
      },
      {
        name: "Pronóstico de Flujo",
        href: "/accounting/cash-flow-forecast",
        icon: TrendingUp,
        permission: "can_view_reports" as PermissionName,
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        name: "CRM Dashboard",
        href: "/crm",
        icon: LayoutDashboard,
        permission: "can_manage_contacts" as PermissionName,
      },
      {
        name: "Chat",
        href: "/crm/chat",
        icon: MessageSquare,
        permission: "can_manage_contacts" as PermissionName,
      },
      {
        name: "Empresas",
        href: "/companies",
        icon: Building2,
        permission: "can_manage_contacts" as PermissionName,
      },
    ],
  },
  {
    title: "Configuración",
    items: [
      {
        name: "Contactos",
        href: "/contacts",
        icon: Contact,
        permission: "can_manage_contacts" as PermissionName,
      },
      {
        name: "Usuarios",
        href: "/users",
        icon: Users,
        permission: "can_manage_users" as PermissionName,
      },
      {
        name: "Canales de Venta",
        href: "/sales-channels",
        icon: ShoppingCart,
        permission: "can_view_sales" as PermissionName,
      },
      {
        name: "Configuración Empresa",
        href: "/company-setup?edit=true",
        icon: Settings,
        permission: "can_manage_users" as PermissionName,
      },
      {
        name: "Monitoreo",
        href: "/monitoring",
        icon: Activity,
        permission: "can_view_dashboard" as PermissionName,
      },
    ],
  },
];
