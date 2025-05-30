
import { usePermissions } from '@/hooks/usePermissions';

export function useDefaultRedirect() {
  const { hasPermission, isLoading, isAdmin } = usePermissions();

  console.log("🏠 [DEFAULT_REDIRECT DEBUG] Hook called - isLoading:", isLoading, "isAdmin:", isAdmin);

  if (isLoading) {
    console.log("⏳ [DEFAULT_REDIRECT DEBUG] Still loading permissions, returning loading state");
    return { defaultRoute: null, isLoading: true };
  }

  // Si es admin, ir al dashboard
  if (isAdmin) {
    console.log("👑 [DEFAULT_REDIRECT DEBUG] User is admin, redirecting to /dashboard");
    return { defaultRoute: '/dashboard', isLoading: false };
  }

  // Orden de prioridad para usuarios no-admin
  const routePriority = [
    { route: '/dashboard', permission: 'can_view_dashboard' as const },
    { route: '/sales', permission: 'can_view_sales' as const },
    { route: '/sales/invoices', permission: 'can_view_invoices' as const },
    { route: '/expenses', permission: 'can_view_expenses' as const },
    { route: '/contacts', permission: 'can_manage_contacts' as const },
    { route: '/accounting/banking', permission: 'can_view_banking' as const },
    { route: '/accounting/reports', permission: 'can_view_reports' as const },
    { route: '/users', permission: 'can_manage_users' as const },
  ];

  console.log("🔍 [DEFAULT_REDIRECT DEBUG] Checking route priority for non-admin user...");

  // Encontrar la primera ruta disponible
  for (const { route, permission } of routePriority) {
    const canAccess = hasPermission(permission);
    console.log(`🔑 [DEFAULT_REDIRECT DEBUG] Checking ${route} (${permission}): ${canAccess}`);
    if (canAccess) {
      console.log(`✅ [DEFAULT_REDIRECT DEBUG] Found accessible route: ${route}`);
      return { defaultRoute: route, isLoading: false };
    }
  }

  // Si no tiene permisos para nada, ir a profile (siempre disponible)
  console.log("⚠️ [DEFAULT_REDIRECT DEBUG] No accessible routes found, defaulting to /profile");
  return { defaultRoute: '/profile', isLoading: false };
}
