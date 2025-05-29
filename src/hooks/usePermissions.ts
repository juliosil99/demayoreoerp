
import { useQuery } from "@tanstack/react-query";
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
  | 'can_manage_reconciliation';

export function usePermissions() {
  const { user, isAdmin } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      // Si es admin, tiene todos los permisos
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
          'can_manage_reconciliation': true
        };
        return allPermissions;
      }

      // Obtener permisos del usuario desde la base de datos
      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission_name, can_access")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error obteniendo permisos del usuario:", error);
        return {};
      }

      // Convertir a objeto para facilitar el acceso
      const permissionsMap: Record<string, boolean> = {};
      data?.forEach(permission => {
        permissionsMap[permission.permission_name] = permission.can_access;
      });

      return permissionsMap;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  const hasPermission = (permission: PermissionName): boolean => {
    if (isAdmin) return true;
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
    isAdmin
  };
}
