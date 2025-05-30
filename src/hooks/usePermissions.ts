
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
      if (!user?.id) {
        console.log("🚫 [PERMISSIONS DEBUG] No user ID available");
        return {};
      }

      console.log("🔐 [PERMISSIONS DEBUG] === STARTING PERMISSIONS QUERY ===");
      console.log("🔐 [PERMISSIONS DEBUG] User ID:", user.id);
      console.log("🔐 [PERMISSIONS DEBUG] User email:", user.email);
      console.log("🔐 [PERMISSIONS DEBUG] Is admin from AuthContext:", isAdmin);

      // Si es admin según AuthContext, dar todos los permisos
      if (isAdmin) {
        console.log("👑 [PERMISSIONS DEBUG] User is admin according to AuthContext, granting all permissions");
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
      console.log("👤 [PERMISSIONS DEBUG] User is not admin, fetching granular permissions from user_permissions");

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

      console.log("🔍 [PERMISSIONS DEBUG] About to execute Supabase query...");
      console.log("🔍 [PERMISSIONS DEBUG] Query: SELECT permission_name, can_access FROM user_permissions WHERE user_id = ?", user.id);

      // Obtener permisos granulares desde user_permissions
      const { data: userPermissionOverrides, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("permission_name, can_access")
        .eq("user_id", user.id);

      console.log("📊 [PERMISSIONS DEBUG] === SUPABASE QUERY RESULT ===");
      console.log("📊 [PERMISSIONS DEBUG] Error:", permissionsError);
      console.log("📊 [PERMISSIONS DEBUG] Data:", userPermissionOverrides);
      console.log("📊 [PERMISSIONS DEBUG] Data length:", userPermissionOverrides?.length || 0);
      console.log("📊 [PERMISSIONS DEBUG] Data type:", typeof userPermissionOverrides);

      if (permissionsError) {
        console.error("❌ [PERMISSIONS DEBUG] Supabase error details:", {
          message: permissionsError.message,
          details: permissionsError.details,
          hint: permissionsError.hint,
          code: permissionsError.code
        });
        return userPermissions; // Retornar permisos vacíos en caso de error
      }

      // Verificar si la consulta devolvió datos
      if (!userPermissionOverrides) {
        console.log("⚠️ [PERMISSIONS DEBUG] userPermissionOverrides is null/undefined");
        return userPermissions;
      }

      if (Array.isArray(userPermissionOverrides) && userPermissionOverrides.length === 0) {
        console.log("⚠️ [PERMISSIONS DEBUG] userPermissionOverrides is empty array");
        
        // Hacer una consulta adicional para verificar si existen permisos para este usuario
        console.log("🔍 [PERMISSIONS DEBUG] Making additional verification query...");
        const { data: verificationData, error: verificationError } = await supabase
          .from("user_permissions")
          .select("*")
          .eq("user_id", user.id);
        
        console.log("🔍 [PERMISSIONS DEBUG] Verification query result:", {
          data: verificationData,
          error: verificationError,
          dataLength: verificationData?.length || 0
        });

        return userPermissions;
      }

      if (userPermissionOverrides && userPermissionOverrides.length > 0) {
        console.log("✅ [PERMISSIONS DEBUG] Found permissions in database:", userPermissionOverrides);
        
        // Aplicar permisos granulares desde user_permissions
        userPermissionOverrides.forEach(permission => {
          console.log("🔑 [PERMISSIONS DEBUG] Processing permission:", permission);
          const permissionName = permission.permission_name as PermissionName;
          if (permissionName in userPermissions) {
            userPermissions[permissionName] = permission.can_access;
            console.log(`🔑 [PERMISSIONS DEBUG] Setting ${permissionName} = ${permission.can_access}`);
          } else {
            console.log(`⚠️ [PERMISSIONS DEBUG] Unknown permission name: ${permissionName}`);
          }
        });
      }

      console.log("✅ [PERMISSIONS DEBUG] === FINAL RESULT ===");
      console.log("✅ [PERMISSIONS DEBUG] Final permissions for", user.email, ":", userPermissions);
      console.log("✅ [PERMISSIONS DEBUG] === END PERMISSIONS QUERY ===");
      
      return userPermissions;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    // Agregar retry y refetch config para debugging
    retry: (failureCount, error) => {
      console.log("🔄 [PERMISSIONS DEBUG] Query retry attempt:", failureCount, "Error:", error);
      return failureCount < 3;
    },
    refetchOnWindowFocus: false, // Evitar refetch automático para debugging
  });

  const hasPermission = (permission: PermissionName): boolean => {
    console.log(`🔍 [PERMISSIONS DEBUG] === CHECKING PERMISSION: ${permission} ===`);
    console.log(`🔍 [PERMISSIONS DEBUG] isAdmin: ${isAdmin}`);
    console.log(`🔍 [PERMISSIONS DEBUG] permissions object:`, permissions);
    console.log(`🔍 [PERMISSIONS DEBUG] permissions[${permission}]:`, permissions?.[permission]);
    
    if (isAdmin) {
      console.log(`👑 [PERMISSIONS DEBUG] Admin access granted for ${permission}`);
      return true;
    }
    
    const result = permissions?.[permission] || false;
    console.log(`🔍 [PERMISSIONS DEBUG] Final result for ${permission}: ${result}`);
    console.log(`🔍 [PERMISSIONS DEBUG] === END PERMISSION CHECK ===`);
    return result;
  };

  const canAccess = (permission: PermissionName): boolean => {
    return hasPermission(permission);
  };

  console.log("📊 [PERMISSIONS DEBUG] Hook state summary:");
  console.log("📊 [PERMISSIONS DEBUG] - isLoading:", isLoading);
  console.log("📊 [PERMISSIONS DEBUG] - isAdmin:", isAdmin);
  console.log("📊 [PERMISSIONS DEBUG] - user email:", user?.email);
  console.log("📊 [PERMISSIONS DEBUG] - user id:", user?.id);
  console.log("📊 [PERMISSIONS DEBUG] - permissions object:", permissions);

  return {
    permissions: permissions || {},
    hasPermission,
    canAccess,
    isLoading,
    isAdmin
  };
}
