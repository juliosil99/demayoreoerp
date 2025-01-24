import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Building2,
  FileText,
  BanknoteIcon,
  ArrowLeftRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Building2, label: "Contabilidad", to: "/accounting" },
  { icon: Receipt, label: "Cuentas por Cobrar", to: "/receivables" },
  { icon: Wallet, label: "Cuentas por Pagar", to: "/payables" },
  { icon: BanknoteIcon, label: "Bancos", to: "/banking" },
  { icon: ArrowLeftRight, label: "Conciliación", to: "/reconciliation" },
  { icon: FileText, label: "Reportes", to: "/reports" },
];

export function Sidebar() {
  return (
    <div className="h-screen w-64 border-r bg-background px-3 py-4">
      <div className="mb-8 px-3.5">
        <h2 className="font-semibold text-lg text-primary">ERP System</h2>
      </div>
      <nav className="space-y-0.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
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
        ))}
      </nav>
    </div>
  );
}