
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
  | 'can_manage_reconciliation';

export function usePermissions() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["simplified-user-permissions", user?.id],
    queryFn: async () => {
      console.log("🔐 [PERMISSIONS] === QUERY START ===");
      console.log("🔐 [PERMISSIONS] User ID:", user?.id);
      console.log("🔐 [PERMISSIONS] User Email:", user?.email);
      console.log("🔐 [PERMISSIONS] isAdmin from AuthContext:", isAdmin);

      if (!user?.id) {
        console.log("❌ [PERMISSIONS] No user ID - returning empty permissions");
        return {};
      }

      // Si es admin según AuthContext, dar todos los permisos
      if (isAdmin) {
        console.log("👑 [PERMISSIONS] Admin user - granting all permissions");
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

      console.log("📊 [PERMISSIONS] Executing Supabase query...");

      try {
        // Obtener permisos granulares desde user_permissions
        const { data: userPermissionOverrides, error: permissionsError } = await supabase
          .from("user_permissions")
          .select("permission_name, can_access")
          .eq("user_id", user.id);

        console.log("📊 [PERMISSIONS] Supabase response:");
        console.log("📊 [PERMISSIONS] - Error:", permissionsError);
        console.log("📊 [PERMISSIONS] - Data:", userPermissionOverrides);
        console.log("📊 [PERMISSIONS] - Data length:", userPermissionOverrides?.length || 0);

        if (permissionsError) {
          console.error("❌ [PERMISSIONS] Supabase error:", permissionsError.message);
          console.error("❌ [PERMISSIONS] Full error:", permissionsError);
          return userPermissions;
        }

        if (userPermissionOverrides && userPermissionOverrides.length > 0) {
          console.log("✅ [PERMISSIONS] Processing permissions from database...");
          
          // Aplicar permisos granulares desde user_permissions
          userPermissionOverrides.forEach(permission => {
            const permissionName = permission.permission_name as PermissionName;
            if (permissionName in userPermissions) {
              userPermissions[permissionName] = permission.can_access;
              console.log(`🔑 [PERMISSIONS] Set ${permissionName} = ${permission.can_access}`);
            }
          });

          // Log final de permisos
          const truePermissions = Object.entries(userPermissions)
            .filter(([_, value]) => value)
            .map(([key, _]) => key);
          
          console.log("✅ [PERMISSIONS] Final granted permissions:", truePermissions);
          console.log("🔑 [PERMISSIONS] can_view_sales final value:", userPermissions.can_view_sales);
        } else {
          console.log("⚠️ [PERMISSIONS] No permissions found in database");
        }

        console.log("🔐 [PERMISSIONS] === QUERY END ===");
        return userPermissions;

      } catch (error) {
        console.error("💥 [PERMISSIONS] Unexpected error:", error);
        return userPermissions;
      }
    },
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: (failureCount, error) => {
      console.log("🔄 [PERMISSIONS] Query retry attempt:", failureCount, error);
      return failureCount < 3;
    },
  });

  // Función para invalidar manualmente el caché de permisos
  const invalidatePermissions = () => {
    console.log("🔄 [PERMISSIONS] Manually invalidating permissions cache");
    queryClient.invalidateQueries({ 
      queryKey: ["simplified-user-permissions", user?.id] 
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
