
import React from 'react';
import { usePermissions, PermissionName } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: PermissionName;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { hasPermission, isAdmin } = usePermissions();

  if (isAdmin || hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
