
import { usePermissions } from '@/hooks/usePermissions';

export function useDefaultRedirect() {
  const { hasPermission, isLoading, isAdmin } = usePermissions();

  if (isLoading) {
    return { defaultRoute: null, isLoading: true };
  }

  // PRIORIDAD #1: Siempre intentar ir a Contactos primero
  const canAccessContacts = isAdmin || hasPermission('can_manage_contacts');
  
  if (canAccessContacts) {
    return { defaultRoute: '/contacts', isLoading: false };
  }

  // PRIORIDAD #2: Si no puede acceder a Contactos y es admin, ir a dashboard
  if (isAdmin) {
    return { defaultRoute: '/dashboard', isLoading: false };
  }

  // PRIORIDAD #3: Orden de fallback para usuarios no-admin sin acceso a Contactos
  const routePriority = [
    { route: '/dashboard', permission: 'can_view_dashboard' as const },
    { route: '/sales', permission: 'can_view_sales' as const },
    { route: '/sales/invoices', permission: 'can_view_invoices' as const },
    { route: '/expenses', permission: 'can_view_expenses' as const },
    { route: '/accounting/banking', permission: 'can_view_banking' as const },
    { route: '/accounting/reports', permission: 'can_view_reports' as const },
    { route: '/users', permission: 'can_manage_users' as const },
  ];

  // Encontrar la primera ruta disponible
  for (const { route, permission } of routePriority) {
    const canAccess = hasPermission(permission);
    if (canAccess) {
      return { defaultRoute: route, isLoading: false };
    }
  }

  // Si no tiene permisos para nada, ir a profile (siempre disponible)
  return { defaultRoute: '/profile', isLoading: false };
}
