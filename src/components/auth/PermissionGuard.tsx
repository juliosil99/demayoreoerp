
import React from 'react';
import { usePermissions, PermissionName } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: PermissionName;
  fallback?: React.ReactNode;
  showLoadingState?: boolean;
}

export function PermissionGuard({ 
  children, 
  permission, 
  fallback = null, 
  showLoadingState = false 
}: PermissionGuardProps) {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  if (isLoading && showLoadingState) {
    return (
      <div className="animate-pulse bg-gray-200 rounded h-4 w-20"></div>
    );
  }

  if (isLoading && !showLoadingState) {
    return null;
  }

  if (isAdmin || hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
