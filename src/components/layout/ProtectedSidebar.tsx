
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
  const { canAccessPage, isLoading, isAdmin } = usePagePermissions();
  const isActive = (path: string) => location.pathname === path;

  // Mostrar loading mientras cargamos permisos
  if (isLoading) {
    return (
      <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-semibold">Goco ERP</h1>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2">
          <div className="animate-pulse space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Debug: mostrar información de permisos para admins
  const showDebugInfo = isAdmin && process.env.NODE_ENV === 'development';

  // Filtrar elementos del sidebar basado en permisos
  const menuItems = [];

  // Dashboard
  if (canAccessPage('/dashboard')) {
    menuItems.push(
      <SidebarItem
        key="dashboard"
        to="/dashboard"
        icon={LayoutDashboard}
        label="Dashboard"
        isActive={isActive('/dashboard')}
      />
    );
  }

  // Grupo de Ventas
  const salesItems = [];
  if (canAccessPage('/sales')) {
    salesItems.push(
      <SidebarItem
        key="sales"
        to="/sales"
        icon={ShoppingCart}
        label="Ventas"
        isActive={isActive('/sales')}
      />
    );
  }
  if (canAccessPage('/sales/payments')) {
    salesItems.push(
      <SidebarItem
        key="payments"
        to="/sales/payments"
        icon={CreditCard}
        label="Pagos"
        isActive={isActive('/sales/payments')}
      />
    );
  }

  // Grupo de Facturas
  const invoiceItems = [];
  if (canAccessPage('/sales/invoices')) {
    invoiceItems.push(
      <SidebarItem
        key="invoices"
        to="/sales/invoices"
        icon={Receipt}
        label="Facturas"
        isActive={isActive('/sales/invoices')}
      />
    );
  }
  if (canAccessPage('/product-search')) {
    invoiceItems.push(
      <SidebarItem
        key="product-search"
        to="/product-search"
        icon={FileSearch}
        label="Buscar Productos"
        isActive={isActive('/product-search')}
      />
    );
  }
  if (canAccessPage('/pdf-templates')) {
    invoiceItems.push(
      <SidebarItem
        key="pdf-templates"
        to="/pdf-templates"
        icon={FileText}
        label="Plantillas PDF"
        isActive={isActive('/pdf-templates')}
      />
    );
  }

  // Grupo de Finanzas
  const financeItems = [];
  if (canAccessPage('/expenses')) {
    financeItems.push(
      <SidebarItem
        key="expenses"
        to="/expenses"
        icon={FileSpreadsheet}
        label="Gastos"
        isActive={isActive('/expenses')}
      />
    );
  }
  if (canAccessPage('/expenses/reconciliation')) {
    financeItems.push(
      <SidebarItem
        key="reconciliation"
        to="/expenses/reconciliation"
        icon={FilePlus2}
        label="Conciliación"
        isActive={isActive('/expenses/reconciliation')}
      />
    );
  }
  if (canAccessPage('/expenses/receivables')) {
    financeItems.push(
      <SidebarItem
        key="receivables"
        to="/expenses/receivables"
        icon={CreditCard}
        label="Por Cobrar"
        isActive={isActive('/expenses/receivables')}
      />
    );
  }
  if (canAccessPage('/expenses/payables')) {
    financeItems.push(
      <SidebarItem
        key="payables"
        to="/expenses/payables"
        icon={CreditCard}
        label="Por Pagar"
        isActive={isActive('/expenses/payables')}
      />
    );
  }
  if (canAccessPage('/accounting/banking')) {
    financeItems.push(
      <SidebarItem
        key="banking"
        to="/accounting/banking"
        icon={Building}
        label="Bancos"
        isActive={isActive('/accounting/banking')}
      />
    );
  }
  if (canAccessPage('/accounting/transfers')) {
    financeItems.push(
      <SidebarItem
        key="transfers"
        to="/accounting/transfers"
        icon={CreditCard}
        label="Transferencias"
        isActive={isActive('/accounting/transfers')}
      />
    );
  }
  if (canAccessPage('/accounting/chart-of-accounts')) {
    financeItems.push(
      <SidebarItem
        key="chart-of-accounts"
        to="/accounting/chart-of-accounts"
        icon={BarChart3}
        label="Catálogo de Cuentas"
        isActive={isActive('/accounting/chart-of-accounts')}
      />
    );
  }
  if (canAccessPage('/accounting/reports')) {
    financeItems.push(
      <SidebarItem
        key="reports"
        to="/accounting/reports"
        icon={BarChart3}
        label="Reportes"
        isActive={isActive('/accounting/reports')}
      />
    );
  }
  if (canAccessPage('/accounting/cash-flow-forecast')) {
    financeItems.push(
      <SidebarItem
        key="cash-flow"
        to="/accounting/cash-flow-forecast"
        icon={BarChart3}
        label="Flujo de Efectivo"
        isActive={isActive('/accounting/cash-flow-forecast')}
      />
    );
  }

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">Goco ERP</h1>
        {showDebugInfo && (
          <div className="text-xs text-gray-400 mt-1">
            {isAdmin ? 'Admin' : 'Usuario'} - Debug Mode
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {/* Dashboard */}
        {menuItems}

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

        {/* Usuarios - Solo para admins o usuarios con permisos específicos */}
        {canAccessPage('/users') && (
          <SidebarItem
            to="/users"
            icon={Users}
            label="Usuarios"
            isActive={isActive('/users')}
          />
        )}

        {/* Debug info para desarrollo */}
        {showDebugInfo && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
            <div className="text-yellow-400 mb-1">Debug Info:</div>
            <div>Sales: {canAccessPage('/sales') ? '✓' : '✗'}</div>
            <div>Expenses: {canAccessPage('/expenses') ? '✓' : '✗'}</div>
            <div>Users: {canAccessPage('/users') ? '✓' : '✗'}</div>
            <div>Banking: {canAccessPage('/accounting/banking') ? '✓' : '✗'}</div>
          </div>
        )}
      </div>
    </aside>
  );
};
