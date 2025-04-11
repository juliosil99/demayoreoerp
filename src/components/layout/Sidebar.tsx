
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Wallet, Building2, FileText, BanknoteIcon, ArrowLeftRight, DollarSign, CreditCard, FileX, Users, BookOpen, UserCog, ChevronRight, LineChart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const menuItems = [{
  icon: LayoutDashboard,
  label: "Panel de Control",
  to: "/"
}, {
  icon: DollarSign,
  label: "Ventas",
  to: "/sales",
  submenu: [{
    icon: CreditCard,
    label: "Pagos Recibidos",
    to: "/sales/payments"
  }, {
    icon: Receipt,
    label: "Cuentas por Cobrar",
    to: "/expenses/receivables"
  }]
}, {
  icon: Receipt,
  label: "Gastos",
  to: "/expenses",
  submenu: [{
    icon: ArrowLeftRight,
    label: "Conciliación",
    to: "/expenses/reconciliation"
  }, {
    icon: Wallet,
    label: "Cuentas por Pagar",
    to: "/expenses/payables"
  }]
}, {
  icon: Users,
  label: "Contactos",
  to: "/contacts"
}, {
  icon: Building2,
  label: "Contabilidad",
  to: "/accounting",
  submenu: [{
    icon: BookOpen,
    label: "Catálogo de Cuentas",
    to: "/accounting/chart-of-accounts"
  }, {
    icon: BanknoteIcon,
    label: "Bancos",
    to: "/accounting/banking"
  }, {
    icon: FileX,
    label: "Facturas",
    to: "/sales/invoices"
  }, {
    icon: FileText,
    label: "Reportes",
    to: "/accounting/reports"
  }, {
    icon: LineChart,
    label: "Pronóstico de Flujo",
    to: "/accounting/cash-flow-forecast"
  }]
}, {
  icon: UserCog,
  label: "Administrar Usuarios",
  to: "/users"
}];

export function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  
  // Auto-expand current path section
  useState(() => {
    const path = window.location.pathname;
    menuItems.forEach(item => {
      if (item.submenu && (path === item.to || path.startsWith(item.to + '/'))) {
        setExpandedMenus(prev => ({
          ...prev,
          [item.to]: true
        }));
      }
    });
  });

  const toggleSubmenu = (path: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  return (
    <div className="h-full w-full border-r bg-background p-2 md:p-4 overflow-y-auto">
      <div className="mb-4 md:mb-8">
        <h2 className="px-2 font-semibold text-base md:text-lg text-primary">demayoreo.com</h2>
      </div>
      <nav className="space-y-0.5">
        {menuItems.map(item => (
          <div key={item.to}>
            <div className="flex items-center">
              <NavLink 
                to={item.to} 
                className={({isActive}) => cn(
                  "flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-sm transition-all hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
              {item.submenu && (
                <button 
                  onClick={() => toggleSubmenu(item.to)} 
                  className="p-1.5 md:p-2 hover:bg-accent rounded-lg transition-colors" 
                  aria-label={expandedMenus[item.to] ? "Colapsar menú" : "Expandir menú"}
                >
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    expandedMenus[item.to] && "transform rotate-90"
                  )} />
                </button>
              )}
            </div>
            {item.submenu && (
              <div className={cn(
                "ml-4 md:ml-6 space-y-1 overflow-hidden transition-all duration-200",
                expandedMenus[item.to] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                {item.submenu.map(subItem => (
                  <NavLink 
                    key={subItem.to} 
                    to={subItem.to} 
                    className={({isActive}) => cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm transition-all hover:bg-accent",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    <subItem.icon className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">{subItem.label}</span>
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
