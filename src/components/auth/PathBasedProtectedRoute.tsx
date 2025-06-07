
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useDefaultRedirect } from '@/hooks/useDefaultRedirect';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface PathBasedProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PathBasedProtectedRoute({ children, fallback }: PathBasedProtectedRouteProps) {
  const location = useLocation();
  const { canAccessPage, isLoading, isAdmin } = usePagePermissions();
  const { defaultRoute, isLoading: isLoadingRedirect } = useDefaultRedirect();

  if (isLoading || isLoadingRedirect) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Admins have access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user can access current page
  const hasAccess = canAccessPage(location.pathname);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // If user has a default route available, redirect there
    if (defaultRoute) {
      return <Navigate to={defaultRoute} replace />;
    }

    // Fallback to error message if no accessible routes
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            No tienes permisos para acceder a esta página. Contacta al administrador si necesitas acceso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
