
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ShoppingCart,
  CreditCard,
  Receipt,
  Users,
  FileSearch,
  FileText,
  Building,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileSpreadsheet,
  FilePlus2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = React.memo(({ icon: Icon, label, to, onClick, isActive }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-800 group',
      isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
    )}
  >
    <Icon className="h-5 w-5 mr-3" />
    <span>{label}</span>
  </Link>
));

const SidebarGroup = ({ title, children, isOpen = false }: any) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div className="mb-2">
      <button
        className="flex items-center justify-between w-full px-3 py-2 text-gray-200 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium">{title}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="pl-3 space-y-1">{children}</div>}
    </div>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">Goco ERP</h1>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        <SidebarItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={isActive('/dashboard')}
        />

        <SidebarGroup title="Ventas" isOpen={location.pathname.startsWith('/sales')}>
          <SidebarItem
            to="/sales"
            icon={ShoppingCart}
            label="Ventas"
            isActive={isActive('/sales')}
          />
          <SidebarItem
            to="/sales/payments"
            icon={CreditCard}
            label="Pagos"
            isActive={isActive('/sales/payments')}
          />
        </SidebarGroup>

        <SidebarGroup title="Facturas" isOpen={location.pathname.startsWith('/sales/invoices') || location.pathname === '/product-search' || location.pathname === '/pdf-templates'}>
          <SidebarItem
            to="/sales/invoices"
            icon={Receipt}
            label="Facturas"
            isActive={isActive('/sales/invoices')}
          />
          <SidebarItem
            to="/product-search"
            icon={FileSearch}
            label="Buscar Productos"
            isActive={isActive('/product-search')}
          />
          <SidebarItem
            to="/pdf-templates"
            icon={FileText}
            label="Plantillas PDF"
            isActive={isActive('/pdf-templates')}
          />
        </SidebarGroup>

        <SidebarGroup title="Finanzas" isOpen={location.pathname.startsWith('/expenses') || location.pathname.startsWith('/accounting')}>
          <SidebarItem
            to="/expenses"
            icon={FileSpreadsheet}
            label="Gastos"
            isActive={isActive('/expenses')}
          />
          <SidebarItem
            to="/expenses/reconciliation"
            icon={FilePlus2}
            label="Conciliación"
            isActive={isActive('/expenses/reconciliation')}
          />
          <SidebarItem
            to="/expenses/receivables"
            icon={CreditCard}
            label="Por Cobrar"
            isActive={isActive('/expenses/receivables')}
          />
          <SidebarItem
            to="/expenses/payables"
            icon={CreditCard}
            label="Por Pagar"
            isActive={isActive('/expenses/payables')}
          />
          <SidebarItem
            to="/accounting/banking"
            icon={Building}
            label="Bancos"
            isActive={isActive('/accounting/banking')}
          />
          <SidebarItem
            to="/accounting/transfers"
            icon={CreditCard}
            label="Transferencias"
            isActive={isActive('/accounting/transfers')}
          />
          <SidebarItem
            to="/accounting/chart-of-accounts"
            icon={BarChart3}
            label="Catálogo de Cuentas"
            isActive={isActive('/accounting/chart-of-accounts')}
          />
          <SidebarItem
            to="/accounting/reports"
            icon={BarChart3}
            label="Reportes"
            isActive={isActive('/accounting/reports')}
          />
          <SidebarItem
            to="/accounting/cash-flow-forecast"
            icon={BarChart3}
            label="Flujo de Efectivo"
            isActive={isActive('/accounting/cash-flow-forecast')}
          />
        </SidebarGroup>

        <SidebarItem
          to="/contacts"
          icon={Users}
          label="Contactos"
          isActive={isActive('/contacts')}
        />

        <SidebarItem
          to="/users"
          icon={Users}
          label="Usuarios"
          isActive={isActive('/users')}
        />
      </div>
    </aside>
  );
};
