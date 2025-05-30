
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
    queryKey: ["simplified-user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      console.log("🔐 Fetching simplified permissions for user:", user.id);

      // Si es admin según AuthContext, dar todos los permisos
      if (isAdmin) {
        console.log("👑 User is admin according to AuthContext, granting all permissions");
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

      // Para usuarios no-admin, usar únicamente user_permissions como fuente de verdad
      console.log("👤 User is not admin, fetching granular permissions from user_permissions");

      // Inicializar con todos los permisos en false
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
        'can_manage_reconciliation': false
      };

      // Obtener permisos granulares desde user_permissions
      const { data: userPermissionOverrides, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("permission_name, can_access")
        .eq("user_id", user.id);

      if (permissionsError) {
        console.error("❌ Error fetching user permissions:", permissionsError);
        return userPermissions; // Retornar permisos vacíos en caso de error
      }

      if (userPermissionOverrides && userPermissionOverrides.length > 0) {
        console.log("✅ Applying granular permissions from user_permissions:", userPermissionOverrides);
        
        // Aplicar permisos granulares desde user_permissions
        userPermissionOverrides.forEach(permission => {
          const permissionName = permission.permission_name as PermissionName;
          if (permissionName in userPermissions) {
            userPermissions[permissionName] = permission.can_access;
          }
        });
      } else {
        console.log("ℹ️ No permissions found in user_permissions for user");
      }

      console.log("✅ Final simplified permissions:", userPermissions);
      return userPermissions;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
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
