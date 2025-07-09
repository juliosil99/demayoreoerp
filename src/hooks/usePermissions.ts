
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type PermissionName = 
  | 'can_view_dashboard'
  | 'can_view_sales'
  | 'can_manage_sales'
  | 'can_view_expenses'
  | 'can_manage_expenses'
  | 'can_view_reports'
  | 'can_manage_users'
  | 'can_manage_contacts'
  | 'can_view_banking'
  | 'can_manage_banking'
  | 'can_view_invoices'
  | 'can_manage_invoices'
  | 'can_view_reconciliation'
  | 'can_manage_reconciliation'
  | 'can_view_receivables'
  | 'can_view_users'
  | 'can_view_crm'
  | 'can_view_forecasting'
  | 'can_view_accounting';

export function usePermissions() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["simplified-user-permissions", user?.id, isAdmin],
    queryFn: async () => {
      if (!user?.id) {
        return {};
      }

      // Si es admin según AuthContext, dar todos los permisos
      if (isAdmin) {
        const allPermissions: Record<PermissionName, boolean> = {
          'can_view_dashboard': true,
          'can_view_sales': true,
          'can_manage_sales': true,
          'can_view_expenses': true,
          'can_manage_expenses': true,
          'can_view_reports': true,
          'can_manage_users': true,
          'can_manage_contacts': true,
          'can_view_banking': true,
          'can_manage_banking': true,
          'can_view_invoices': true,
          'can_manage_invoices': true,
          'can_view_reconciliation': true,
          'can_manage_reconciliation': true,
          'can_view_receivables': true,
          'can_view_users': true,
          'can_view_crm': true,
          'can_view_forecasting': true,
          'can_view_accounting': true
        };
        return allPermissions;
      }

      // Inicializar con todos los permisos en false para usuarios no admin
      const userPermissions: Record<PermissionName, boolean> = {
        'can_view_dashboard': false,
        'can_view_sales': false,
        'can_manage_sales': false,
        'can_view_expenses': false,
        'can_manage_expenses': false,
        'can_view_reports': false,
        'can_manage_users': false,
        'can_manage_contacts': false,
        'can_view_banking': false,
        'can_manage_banking': false,
        'can_view_invoices': false,
        'can_manage_invoices': false,
        'can_view_reconciliation': false,
        'can_manage_reconciliation': false,
        'can_view_receivables': false,
        'can_view_users': false,
        'can_view_crm': false,
        'can_view_forecasting': false,
        'can_view_accounting': false
      };

      try {
        // Obtener permisos granulares desde user_permissions
        const { data: userPermissionOverrides, error: permissionsError } = await supabase
          .from("user_permissions")
          .select("permission_name, can_access")
          .eq("user_id", user.id);

        if (permissionsError) {
          return userPermissions;
        }

        if (userPermissionOverrides && userPermissionOverrides.length > 0) {
          // Aplicar permisos granulares desde user_permissions
          userPermissionOverrides.forEach(permission => {
            const permissionName = permission.permission_name as PermissionName;
            if (permissionName in userPermissions) {
              userPermissions[permissionName] = permission.can_access;
            }
          });
        }

        return userPermissions;

      } catch (error) {
        return userPermissions;
      }
    },
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000, // 15 minutos - cache largo para permisos
    gcTime: 30 * 60 * 1000, // 30 minutos en garbage collection
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false, // Sin refetch automático
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
  });

  // Función para invalidar manualmente el caché de permisos
  const invalidatePermissions = () => {
    queryClient.invalidateQueries({ 
      queryKey: ["simplified-user-permissions", user?.id, isAdmin] 
    });
  };

  const hasPermission = (permission: PermissionName): boolean => {
    if (isAdmin) {
      return true;
    }
    return permissions?.[permission] || false;
  };

  const canAccess = (permission: PermissionName): boolean => {
    return hasPermission(permission);
  };

  return {
    permissions: permissions || {},
    hasPermission,
    canAccess,
    isLoading,
    isAdmin,
    invalidatePermissions
  };
}
