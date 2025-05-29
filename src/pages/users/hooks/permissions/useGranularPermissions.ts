
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface GranularPermission {
  permission_name: string;
  can_access: boolean;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: { id: string; nombre: string };
  permissions: GranularPermission[];
  role: 'admin' | 'user';
}

const AVAILABLE_PERMISSIONS = [
  'can_view_dashboard',
  'can_view_sales',
  'can_manage_sales',
  'can_view_expenses',
  'can_manage_expenses',
  'can_view_reports',
  'can_manage_users',
  'can_manage_contacts',
  'can_view_banking',
  'can_manage_banking',
  'can_view_invoices',
  'can_manage_invoices',
  'can_view_reconciliation',
  'can_manage_reconciliation'
] as const;

export type PermissionName = typeof AVAILABLE_PERMISSIONS[number];

export function useGranularPermissions() {
  const queryClient = useQueryClient();

  const { 
    data: usersWithPermissions, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["users-with-permissions"],
    queryFn: async () => {
      console.log("🔍 Obteniendo usuarios con permisos granulares...");
      
      // Paso 1: Obtener perfiles con información de empresa
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          company:companies!left(id, nombre)
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error("❌ Error obteniendo perfiles:", profilesError);
        throw profilesError;
      }

      console.log("✅ Perfiles obtenidos:", profiles);

      // Paso 2: Obtener permisos para todos los usuarios
      const { data: permissions, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("user_id, permission_name, can_access");

      if (permissionsError) {
        console.error("❌ Error obteniendo permisos:", permissionsError);
        throw permissionsError;
      }

      console.log("✅ Permisos obtenidos:", permissions);

      // Paso 3: Obtener roles de company_users
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id, role");

      if (companyUsersError) {
        console.error("❌ Error obteniendo roles:", companyUsersError);
      }

      // Paso 4: Combinar datos
      const usersWithPermissions: UserWithPermissions[] = profiles.map(profile => {
        const userPermissions = permissions?.filter(p => p.user_id === profile.id) || [];
        const companyUser = companyUsers?.find(cu => cu.user_id === profile.id);
        
        // Crear mapa de permisos con valores por defecto
        const permissionsMap: { [key: string]: boolean } = {};
        AVAILABLE_PERMISSIONS.forEach(perm => {
          const userPerm = userPermissions.find(up => up.permission_name === perm);
          permissionsMap[perm] = userPerm?.can_access || false;
        });

        const permissionsArray: GranularPermission[] = AVAILABLE_PERMISSIONS.map(perm => ({
          permission_name: perm,
          can_access: permissionsMap[perm]
        }));

        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          company: Array.isArray(profile.company) 
            ? profile.company[0] 
            : profile.company,
          permissions: permissionsArray,
          role: companyUser?.role === 'admin' ? 'admin' : 'user'
        };
      });

      console.log("✅ Usuarios con permisos combinados:", usersWithPermissions);
      return usersWithPermissions;
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5000,
  });

  const updateUserPermission = async (userId: string, permissionName: string, canAccess: boolean) => {
    try {
      console.log(`🔄 Actualizando permiso ${permissionName} para usuario ${userId}: ${canAccess}`);
      
      const { error } = await supabase
        .from("user_permissions")
        .upsert({
          user_id: userId,
          permission_name: permissionName,
          can_access: canAccess,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,permission_name'
        });

      if (error) {
        console.error("❌ Error actualizando permiso:", error);
        throw error;
      }

      console.log("✅ Permiso actualizado exitosamente");
      
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["users-with-permissions"] });
      
      toast.success(`Permiso ${permissionName} actualizado`);
    } catch (error: any) {
      console.error("❌ Error en updateUserPermission:", error);
      toast.error("Error al actualizar permiso: " + error.message);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      console.log(`🔄 Actualizando rol para usuario ${userId}: ${role}`);
      
      // Primero obtener la empresa del usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: currentUserCompany, error: companyError } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", userData.user.id)
        .single();

      if (companyError) {
        console.error("❌ Error obteniendo empresa del usuario actual:", companyError);
        throw companyError;
      }

      // Actualizar rol en company_users
      const { error } = await supabase
        .from("company_users")
        .update({ role: role })
        .eq("user_id", userId)
        .eq("company_id", currentUserCompany.company_id);

      if (error) {
        console.error("❌ Error actualizando rol:", error);
        throw error;
      }

      // Si es admin, dar todos los permisos
      if (role === 'admin') {
        const updatePromises = AVAILABLE_PERMISSIONS.map(permission =>
          supabase
            .from("user_permissions")
            .upsert({
              user_id: userId,
              permission_name: permission,
              can_access: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,permission_name'
            })
        );

        await Promise.all(updatePromises);
      }

      console.log("✅ Rol actualizado exitosamente");
      
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["users-with-permissions"] });
      
      toast.success(`Rol actualizado a ${role === 'admin' ? 'Administrador' : 'Usuario'}`);
    } catch (error: any) {
      console.error("❌ Error en updateUserRole:", error);
      toast.error("Error al actualizar rol: " + error.message);
      throw error;
    }
  };

  return {
    usersWithPermissions,
    isLoading,
    error,
    refetch,
    updateUserPermission,
    updateUserRole,
    availablePermissions: AVAILABLE_PERMISSIONS
  };
}
