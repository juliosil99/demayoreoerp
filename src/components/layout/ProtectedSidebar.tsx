
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
import { usePagePermissions } from '@/hooks/usePagePermissions';

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
  
  // Si no hay children visibles, no mostrar el grupo
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return null;
  }

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

export const ProtectedSidebar = () => {
  const location = useLocation();
  const { canAccessPage } = usePagePermissions();
  const isActive = (path: string) => location.pathname === path;

  // Filtrar elementos del sidebar basado en permisos
  const menuItems = [
    {
      condition: canAccessPage('/dashboard'),
      component: (
        <SidebarItem
          key="dashboard"
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={isActive('/dashboard')}
        />
      )
    }
  ];

  // Grupo de Ventas
  const salesItems = [
    canAccessPage('/sales') && (
      <SidebarItem
        key="sales"
        to="/sales"
        icon={ShoppingCart}
        label="Ventas"
        isActive={isActive('/sales')}
      />
    ),
    canAccessPage('/sales/payments') && (
      <SidebarItem
        key="payments"
        to="/sales/payments"
        icon={CreditCard}
        label="Pagos"
        isActive={isActive('/sales/payments')}
      />
    )
  ].filter(Boolean);

  // Grupo de Facturas
  const invoiceItems = [
    canAccessPage('/sales/invoices') && (
      <SidebarItem
        key="invoices"
        to="/sales/invoices"
        icon={Receipt}
        label="Facturas"
        isActive={isActive('/sales/invoices')}
      />
    ),
    canAccessPage('/product-search') && (
      <SidebarItem
        key="product-search"
        to="/product-search"
        icon={FileSearch}
        label="Buscar Productos"
        isActive={isActive('/product-search')}
      />
    ),
    canAccessPage('/pdf-templates') && (
      <SidebarItem
        key="pdf-templates"
        to="/pdf-templates"
        icon={FileText}
        label="Plantillas PDF"
        isActive={isActive('/pdf-templates')}
      />
    )
  ].filter(Boolean);

  // Grupo de Finanzas
  const financeItems = [
    canAccessPage('/expenses') && (
      <SidebarItem
        key="expenses"
        to="/expenses"
        icon={FileSpreadsheet}
        label="Gastos"
        isActive={isActive('/expenses')}
      />
    ),
    canAccessPage('/expenses/reconciliation') && (
      <SidebarItem
        key="reconciliation"
        to="/expenses/reconciliation"
        icon={FilePlus2}
        label="Conciliación"
        isActive={isActive('/expenses/reconciliation')}
      />
    ),
    canAccessPage('/expenses/receivables') && (
      <SidebarItem
        key="receivables"
        to="/expenses/receivables"
        icon={CreditCard}
        label="Por Cobrar"
        isActive={isActive('/expenses/receivables')}
      />
    ),
    canAccessPage('/expenses/payables') && (
      <SidebarItem
        key="payables"
        to="/expenses/payables"
        icon={CreditCard}
        label="Por Pagar"
        isActive={isActive('/expenses/payables')}
      />
    ),
    canAccessPage('/accounting/banking') && (
      <SidebarItem
        key="banking"
        to="/accounting/banking"
        icon={Building}
        label="Bancos"
        isActive={isActive('/accounting/banking')}
      />
    ),
    canAccessPage('/accounting/transfers') && (
      <SidebarItem
        key="transfers"
        to="/accounting/transfers"
        icon={CreditCard}
        label="Transferencias"
        isActive={isActive('/accounting/transfers')}
      />
    ),
    canAccessPage('/accounting/chart-of-accounts') && (
      <SidebarItem
        key="chart-of-accounts"
        to="/accounting/chart-of-accounts"
        icon={BarChart3}
        label="Catálogo de Cuentas"
        isActive={isActive('/accounting/chart-of-accounts')}
      />
    ),
    canAccessPage('/accounting/reports') && (
      <SidebarItem
        key="reports"
        to="/accounting/reports"
        icon={BarChart3}
        label="Reportes"
        isActive={isActive('/accounting/reports')}
      />
    ),
    canAccessPage('/accounting/cash-flow-forecast') && (
      <SidebarItem
        key="cash-flow"
        to="/accounting/cash-flow-forecast"
        icon={BarChart3}
        label="Flujo de Efectivo"
        isActive={isActive('/accounting/cash-flow-forecast')}
      />
    )
  ].filter(Boolean);

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">Goco ERP</h1>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {/* Dashboard */}
        {menuItems.map((item, index) => item.condition && (
          <div key={index}>{item.component}</div>
        ))}

        {/* Ventas */}
        {salesItems.length > 0 && (
          <SidebarGroup title="Ventas" isOpen={location.pathname.startsWith('/sales')}>
            {salesItems}
          </SidebarGroup>
        )}

        {/* Facturas */}
        {invoiceItems.length > 0 && (
          <SidebarGroup title="Facturas" isOpen={location.pathname.startsWith('/sales/invoices') || location.pathname === '/product-search' || location.pathname === '/pdf-templates'}>
            {invoiceItems}
          </SidebarGroup>
        )}

        {/* Finanzas */}
        {financeItems.length > 0 && (
          <SidebarGroup title="Finanzas" isOpen={location.pathname.startsWith('/expenses') || location.pathname.startsWith('/accounting')}>
            {financeItems}
          </SidebarGroup>
        )}

        {/* Contactos */}
        {canAccessPage('/contacts') && (
          <SidebarItem
            to="/contacts"
            icon={Users}
            label="Contactos"
            isActive={isActive('/contacts')}
          />
        )}

        {/* Usuarios */}
        {canAccessPage('/users') && (
          <SidebarItem
            to="/users"
            icon={Users}
            label="Usuarios"
            isActive={isActive('/users')}
          />
        )}
      </div>
    </aside>
  );
};
