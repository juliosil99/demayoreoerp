
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  ShoppingCart,
  CreditCard,
  Receipt,
  Users,
  FileSearch,
  FileText,
  Building,
  LayoutDashboard,
  FileSpreadsheet,
  FilePlus2,
  Building2,
} from 'lucide-react';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';

export const SidebarContent: React.FC = () => {
  const location = useLocation();
  const { canAccessPage } = usePagePermissions();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-2">
      {/* Dashboard */}
      {canAccessPage('/dashboard') && (
        <SidebarItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={isActive('/dashboard')}
        />
      )}

      {/* CRM */}
      {(canAccessPage('/contacts') || canAccessPage('/companies')) && (
        <SidebarGroup title="CRM" isOpen={location.pathname.startsWith('/contacts') || location.pathname.startsWith('/companies')}>
          {canAccessPage('/companies') && (
            <SidebarItem
              to="/companies"
              icon={Building2}
              label="Empresas"
              isActive={isActive('/companies') || location.pathname.startsWith('/companies/')}
            />
          )}
          {canAccessPage('/contacts') && (
            <SidebarItem
              to="/contacts"
              icon={Users}
              label="Contactos"
              isActive={isActive('/contacts')}
            />
          )}
        </SidebarGroup>
      )}

      {/* Ventas */}
      {(canAccessPage('/sales') || canAccessPage('/sales/payments')) && (
        <SidebarGroup title="Ventas" isOpen={location.pathname.startsWith('/sales')}>
          {canAccessPage('/sales') && (
            <SidebarItem
              to="/sales"
              icon={ShoppingCart}
              label="Ventas"
              isActive={isActive('/sales')}
            />
          )}
          {canAccessPage('/sales/payments') && (
            <SidebarItem
              to="/sales/payments"
              icon={CreditCard}
              label="Pagos"
              isActive={isActive('/sales/payments')}
            />
          )}
        </SidebarGroup>
      )}

      {/* Facturas */}
      {(canAccessPage('/sales/invoices') || canAccessPage('/product-search') || canAccessPage('/pdf-templates')) && (
        <SidebarGroup title="Facturas" isOpen={location.pathname.startsWith('/sales/invoices') || location.pathname === '/product-search' || location.pathname === '/pdf-templates'}>
          {canAccessPage('/sales/invoices') && (
            <SidebarItem
              to="/sales/invoices"
              icon={Receipt}
              label="Facturas"
              isActive={isActive('/sales/invoices')}
            />
          )}
          {canAccessPage('/product-search') && (
            <SidebarItem
              to="/product-search"
              icon={FileSearch}
              label="Buscar Productos"
              isActive={isActive('/product-search')}
            />
          )}
          {canAccessPage('/pdf-templates') && (
            <SidebarItem
              to="/pdf-templates"
              icon={FileText}
              label="Plantillas PDF"
              isActive={isActive('/pdf-templates')}
            />
          )}
        </SidebarGroup>
      )}

      {/* Finanzas */}
      {(canAccessPage('/expenses') || canAccessPage('/expenses/reconciliation') || canAccessPage('/expenses/receivables') || canAccessPage('/expenses/payables') || canAccessPage('/accounting/banking') || canAccessPage('/accounting/transfers') || canAccessPage('/accounting/chart-of-accounts') || canAccessPage('/accounting/reports') || canAccessPage('/accounting/cash-flow-forecast')) && (
        <SidebarGroup title="Finanzas" isOpen={location.pathname.startsWith('/expenses') || location.pathname.startsWith('/accounting')}>
          {canAccessPage('/expenses') && (
            <SidebarItem
              to="/expenses"
              icon={FileSpreadsheet}
              label="Gastos"
              isActive={isActive('/expenses')}
            />
          )}
          {canAccessPage('/expenses/reconciliation') && (
            <SidebarItem
              to="/expenses/reconciliation"
              icon={FilePlus2}
              label="Conciliación"
              isActive={isActive('/expenses/reconciliation')}
            />
          )}
          {canAccessPage('/expenses/receivables') && (
            <SidebarItem
              to="/expenses/receivables"
              icon={CreditCard}
              label="Por Cobrar"
              isActive={isActive('/expenses/receivables')}
            />
          )}
          {canAccessPage('/expenses/payables') && (
            <SidebarItem
              to="/expenses/payables"
              icon={CreditCard}
              label="Por Pagar"
              isActive={isActive('/expenses/payables')}
            />
          )}
          {canAccessPage('/accounting/banking') && (
            <SidebarItem
              to="/accounting/banking"
              icon={Building}
              label="Bancos"
              isActive={isActive('/accounting/banking')}
            />
          )}
          {canAccessPage('/accounting/transfers') && (
            <SidebarItem
              to="/accounting/transfers"
              icon={CreditCard}
              label="Transferencias"
              isActive={isActive('/accounting/transfers')}
            />
          )}
          {canAccessPage('/accounting/chart-of-accounts') && (
            <SidebarItem
              to="/accounting/chart-of-accounts"
              icon={BarChart3}
              label="Catálogo de Cuentas"
              isActive={isActive('/accounting/chart-of-accounts')}
            />
          )}
          {canAccessPage('/accounting/reports') && (
            <SidebarItem
              to="/accounting/reports"
              icon={BarChart3}
              label="Reportes"
              isActive={isActive('/accounting/reports')}
            />
          )}
          {canAccessPage('/accounting/cash-flow-forecast') && (
            <SidebarItem
              to="/accounting/cash-flow-forecast"
              icon={BarChart3}
              label="Flujo de Efectivo"
              isActive={isActive('/accounting/cash-flow-forecast')}
            />
          )}
        </SidebarGroup>
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
    </div>
  );
};
