import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Building2,
  FileText,
  BanknoteIcon,
  ArrowLeftRight,
  DollarSign,
  CreditCard,
  FileX,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  {
    icon: DollarSign,
    label: "Sales",
    to: "/sales",
    submenu: [
      { icon: CreditCard, label: "Payments Received", to: "/sales/payments" },
      { icon: FileX, label: "Invoices", to: "/sales/invoices" }
    ]
  },
  { icon: Receipt, label: "Expenses", to: "/expenses" },
  { icon: Building2, label: "Contabilidad", to: "/accounting" },
  { icon: Receipt, label: "Cuentas por Cobrar", to: "/receivables" },
  { icon: Wallet, label: "Cuentas por Pagar", to: "/payables" },
  { icon: BanknoteIcon, label: "Bancos", to: "/banking" },
  { icon: ArrowLeftRight, label: "Conciliación", to: "/reconciliation" },
  { icon: FileText, label: "Reportes", to: "/reports" },
];

export function Sidebar() {
  return (
    <div className="h-full w-64 border-r bg-background p-4">
      <div className="mb-8">
        <h2 className="px-2 font-semibold text-lg text-primary">ERP System</h2>
      </div>
      <nav className="space-y-0.5">
        {menuItems.map((item) => (
          <div key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
            {item.submenu && (
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )
                    }
                  >
                    <subItem.icon className="h-4 w-4" />
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}