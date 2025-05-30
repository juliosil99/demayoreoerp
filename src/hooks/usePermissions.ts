
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { rolePermissions } from "@/pages/users/types";

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
    queryKey: ["unified-user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      console.log("🔐 Fetching unified permissions for user:", user.id);

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

      // Paso 1: Obtener el rol del usuario desde company_users
      const { data: companyUser, error: roleError } = await supabase
        .from("company_users")
        .select("role, company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError) {
        console.error("❌ Error fetching user role:", roleError);
        return {};
      }

      if (!companyUser) {
        console.log("⚠️ User has no company association");
        return {};
      }

      console.log("📋 User role from company_users:", companyUser.role);

      // Paso 2: Aplicar permisos base según el rol
      const userRole = companyUser.role as 'admin' | 'user';
      const basePermissions = rolePermissions[userRole] || rolePermissions.user;
      
      console.log("🏗️ Base permissions for role", userRole, ":", basePermissions);

      // Paso 3: Crear el objeto de permisos con el rol y permisos base
      const unifiedPermissions: Record<PermissionName, boolean> = {
        can_view_dashboard: basePermissions.can_view_dashboard,
        can_view_sales: basePermissions.can_view_sales,
        can_manage_sales: basePermissions.can_manage_sales,
        can_view_expenses: basePermissions.can_view_expenses,
        can_manage_expenses: basePermissions.can_manage_expenses,
        can_view_reports: basePermissions.can_view_reports,
        can_manage_users: basePermissions.can_manage_users,
        can_manage_contacts: basePermissions.can_manage_contacts,
        can_view_banking: basePermissions.can_view_banking,
        can_manage_banking: basePermissions.can_manage_banking,
        can_view_invoices: basePermissions.can_view_invoices,
        can_manage_invoices: basePermissions.can_manage_invoices,
        can_view_reconciliation: basePermissions.can_view_reconciliation,
        can_manage_reconciliation: basePermissions.can_manage_reconciliation
      };

      // Paso 4: Obtener overrides granulares desde user_permissions
      const { data: userPermissions, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("permission_name, can_access")
        .eq("user_id", user.id);

      if (permissionsError) {
        console.error("❌ Error fetching user permissions overrides:", permissionsError);
        // Continuar con permisos base aunque falle la consulta de overrides
      } else if (userPermissions && userPermissions.length > 0) {
        console.log("🔧 Applying permission overrides from user_permissions:", userPermissions);
        
        // Aplicar overrides específicos desde user_permissions
        userPermissions.forEach(permission => {
          const permissionName = permission.permission_name as PermissionName;
          if (permissionName in unifiedPermissions) {
            unifiedPermissions[permissionName] = permission.can_access;
          }
        });
      } else {
        console.log("ℹ️ No permission overrides found in user_permissions");
      }

      console.log("✅ Final unified permissions:", unifiedPermissions);
      return unifiedPermissions;
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
