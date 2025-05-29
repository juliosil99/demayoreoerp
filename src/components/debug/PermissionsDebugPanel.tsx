
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PermissionsDebugPanel() {
  const { user, isAdmin } = useAuth();
  const { permissions, isLoading, hasPermission } = usePermissions();

  if (!user || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">
          🔧 Debug: Permisos del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2">
          <div>
            <strong>Usuario:</strong> {user.email}
          </div>
          <div>
            <strong>ID:</strong> {user.id}
          </div>
          <div>
            <strong>Es Admin:</strong> {isAdmin ? '✅ Sí' : '❌ No'}
          </div>
          <div>
            <strong>Cargando permisos:</strong> {isLoading ? '⏳ Sí' : '✅ No'}
          </div>
          
          <div className="mt-3">
            <strong>Permisos individuales:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(permissions).map(([permission, hasAccess]) => (
                <Badge 
                  key={permission} 
                  variant={hasAccess ? "default" : "secondary"}
                  className="text-xs"
                >
                  {permission}: {hasAccess ? '✅' : '❌'}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <strong>Test de permisos clave:</strong>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <div>Dashboard: {hasPermission('can_view_dashboard') ? '✅' : '❌'}</div>
              <div>Ventas: {hasPermission('can_view_sales') ? '✅' : '❌'}</div>
              <div>Gastos: {hasPermission('can_view_expenses') ? '✅' : '❌'}</div>
              <div>Usuarios: {hasPermission('can_manage_users') ? '✅' : '❌'}</div>
              <div>Bancos: {hasPermission('can_view_banking') ? '✅' : '❌'}</div>
              <div>Reportes: {hasPermission('can_view_reports') ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
