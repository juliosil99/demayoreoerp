import {
  BookOpen,
  Calculator,
  Calendar,
  ChartBar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Mail,
  MessagesSquare,
  Package,
  Plus,
  Receipt,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  SquareKanban,
  Star,
  Tags,
  Ticket,
  User,
  Users,
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

export const marketingItems: SidebarItem[] = [
  {
    name: "Overview",
    href: "/marketing",
    icon: Gauge,
  },
  {
    name: "Analytics",
    href: "/marketing/analytics",
    icon: ChartBar,
  },
  {
    name: "Automation",
    href: "/marketing/automation",
    icon: SlidersHorizontal,
  },
  {
    name: "Email",
    href: "/marketing/email",
    icon: Mail,
  },
  {
    name: "Social Media",
    href: "/marketing/social-media",
    icon: MessagesSquare,
  },
];

export const settingsItems: SidebarItem[] = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: CircleUserRound,
  },
  {
    name: "Account",
    href: "/settings/account",
    icon: User,
  },
  {
    name: "Appearance",
    href: "/settings/appearance",
    icon: LayoutDashboard,
  },
  {
    name: "Notifications",
    href: "/settings/notifications",
    icon: Mail,
  },
  {
    name: "Integrations",
    href: "/settings/integrations",
    icon: Package,
  },
  {
    name: "API Keys",
    href: "/settings/api-keys",
    icon: Key,
  },
];

export const platformItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: SquareKanban,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: ListChecks,
  },
  {
    name: "Reporting",
    href: "/reporting",
    icon: ClipboardList,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
];

export const applicationItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingBag,
    badge: "12",
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: Star,
  },
];

export const accountingItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/accounting",
    icon: Home,
  },
  {
    name: "Invoices",
    href: "/accounting/invoices",
    icon: FileText,
  },
  {
    name: "Bills",
    href: "/accounting/bills",
    icon: Ticket,
  },
  {
    name: "Transactions",
    href: "/accounting/transactions",
    icon: CreditCard,
  },
  {
    name: "Reporting",
    href: "/accounting/reporting",
    icon: ClipboardList,
  },
];

export const adminItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    requiresAdmin: true,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    requiresAdmin: true,
  },
  {
    name: "Roles",
    href: "/admin/roles",
    icon: CheckCircle,
    requiresAdmin: true,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    requiresAdmin: true,
  },
];

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
    title: "Platform",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        name: "Projects",
        href: "/projects",
        icon: SquareKanban,
      },
      {
        name: "Tasks",
        href: "/tasks",
        icon: ListChecks,
      },
      {
        name: "Reporting",
        href: "/reporting",
        icon: ClipboardList,
      },
      {
        name: "Customers",
        href: "/customers",
        icon: Users,
      },
    ],
  },
  {
    title: "Application",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        name: "Orders",
        href: "/orders",
        icon: ShoppingBag,
        badge: "12",
      },
      {
        name: "Products",
        href: "/products",
        icon: Package,
      },
      {
        name: "Categories",
        href: "/categories",
        icon: Tags,
      },
      {
        name: "Reviews",
        href: "/reviews",
        icon: Star,
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
      }
    ]
  },
  {
    title: "Marketing",
    items: [
      {
        name: "Overview",
        href: "/marketing",
        icon: Gauge,
      },
      {
        name: "Analytics",
        href: "/marketing/analytics",
        icon: ChartBar,
      },
      {
        name: "Automation",
        href: "/marketing/automation",
        icon: SlidersHorizontal,
      },
      {
        name: "Email",
        href: "/marketing/email",
        icon: Mail,
      },
      {
        name: "Social Media",
        href: "/marketing/social-media",
        icon: MessagesSquare,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: Home,
        requiresAdmin: true,
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
        requiresAdmin: true,
      },
      {
        name: "Roles",
        href: "/admin/roles",
        icon: CheckCircle,
        requiresAdmin: true,
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
        requiresAdmin: true,
      },
    ],
  },
];
