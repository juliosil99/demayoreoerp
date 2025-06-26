
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface WithProtectionOptions {
  requiresAdmin?: boolean;
  requiredPermission?: string;
  fallbackComponent?: React.ComponentType;
}

// Simple permission mapping without complex hooks
const PAGE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'can_view_dashboard',
  '/expenses': 'can_view_expenses',
  '/reconciliation': 'can_view_reconciliation',
  '/reconciliation-batches': 'can_view_reconciliation',
  '/invoices': 'can_view_invoices',
  '/payables': 'can_view_expenses',
  '/chart-of-accounts': 'can_view_reports',
  '/reports': 'can_view_reports',
};

export function withProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithProtectionOptions = {}
) {
  const ProtectedComponent = (props: P) => {
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    // Loading state while checking auth
    if (user === undefined) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-muted-foreground">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // Admins have access to everything
    if (isAdmin) {
      return <WrappedComponent {...props} />;
    }

    // Check specific permission requirements
    if (options.requiresAdmin && !isAdmin) {
      return (
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>
              Se requieren permisos de administrador para acceder a esta página.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // For now, we'll allow access to all authenticated users
    // Later, this can be enhanced with actual permission checking
    const requiredPermission = options.requiredPermission || PAGE_PERMISSIONS[location.pathname];
    
    // Simplified permission check (can be enhanced later)
    if (requiredPermission && !isAdmin) {
      // For now, allow access to most pages for authenticated users
      // This can be enhanced with actual Supabase permission queries
      const restrictedPages = ['/admin'];
      if (restrictedPages.some(page => location.pathname.startsWith(page))) {
        return (
          <div className="container mx-auto p-6">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertTitle>Acceso Denegado</AlertTitle>
              <AlertDescription>
                No tienes permisos para acceder a esta página.
              </AlertDescription>
            </Alert>
          </div>
        );
      }
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withProtection(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ProtectedComponent;
}
