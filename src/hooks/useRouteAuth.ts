
import { useAuth } from '@/contexts/AuthContext';

interface RouteAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  canAccess: (requiredPermission?: string, requiresAdmin?: boolean) => boolean;
}

export function useRouteAuth(): RouteAuthResult {
  const { user, isAdmin } = useAuth();

  const isAuthenticated = !!user;
  const isLoading = user === undefined;

  const canAccess = (requiredPermission?: string, requiresAdmin?: boolean): boolean => {
    if (isLoading) return false;
    if (!isAuthenticated) return false;
    if (isAdmin) return true;
    if (requiresAdmin && !isAdmin) return false;
    
    // For now, allow access to most pages for authenticated users
    // This can be enhanced with actual permission checking later
    return true;
  };

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    canAccess
  };
}
