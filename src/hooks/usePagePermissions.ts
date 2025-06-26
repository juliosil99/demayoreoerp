
import { usePermissions, PermissionName } from '@/hooks/usePermissions';

interface PagePermissionMap {
  [key: string]: PermissionName;
}

const PAGE_PERMISSIONS: PagePermissionMap = {
  '/dashboard': 'can_view_dashboard',
  '/crm': 'can_manage_contacts',
  '/sales': 'can_view_sales',
  '/sales/payments': 'can_view_sales',
  '/sales/invoices': 'can_view_invoices',
  '/expenses': 'can_view_expenses',
  '/reconciliation': 'can_view_reconciliation',
  '/reconciliation-batches': 'can_view_reconciliation',
  '/expenses/receivables': 'can_view_expenses',
  '/expenses/payables': 'can_view_expenses',
  '/payables': 'can_view_expenses',
  '/invoices': 'can_view_invoices',
  '/contacts': 'can_manage_contacts',
  '/companies': 'can_manage_contacts',
  '/users': 'can_manage_users',
  '/accounting': 'can_view_reports',
  '/accounting/banking': 'can_view_banking',
  '/chart-of-accounts': 'can_view_reports',
  '/reports': 'can_view_reports',
  '/accounting/reports': 'can_view_reports',
  '/accounting/transfers': 'can_manage_banking',
  '/accounting/cash-flow-forecast': 'can_view_reports',
  '/product-search': 'can_view_invoices',
  '/pdf-templates': 'can_manage_invoices',
};

export function usePagePermissions() {
  const { hasPermission, isLoading, isAdmin } = usePermissions();

  const canAccessPage = (path: string): boolean => {
    if (isLoading) return false;
    if (isAdmin) return true;
    
    const permission = PAGE_PERMISSIONS[path];
    if (!permission) return true; // Allow access to pages without specific permissions
    
    return hasPermission(permission);
  };

  const getRequiredPermission = (path: string): PermissionName | undefined => {
    return PAGE_PERMISSIONS[path];
  };

  return {
    canAccessPage,
    getRequiredPermission,
    hasPermission,
    isLoading,
    isAdmin
  };
}
