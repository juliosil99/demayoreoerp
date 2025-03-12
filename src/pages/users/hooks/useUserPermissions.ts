
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPermissions, Profile } from "../types";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: isProfilesLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        toast.error("Error al cargar usuarios: " + error.message);
        throw error;
      }
      return data as Profile[];
    },
  });

  const { data: pagePermissions, isLoading: isPagePermissionsLoading } = useQuery({
    queryKey: ["page-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_permissions")
        .select("*");
      
      if (error) {
        toast.error("Error al cargar permisos de página: " + error.message);
        throw error;
      }
      return data;
    },
  });

  const { data: rolePermissions, isLoading: isRolePermissionsLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");

      if (error) {
        toast.error("Error al cargar roles: " + error.message);
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    if (pagePermissions && rolePermissions) {
      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      // Inicializar con todos los usuarios
      profiles?.forEach(profile => {
        if (!permissionsMap[profile.id]) {
          permissionsMap[profile.id] = {
            userId: profile.id,
            pages: {},
            role: 'user'
          };
        }
      });
      
      // Agregar permisos de páginas
      pagePermissions.forEach((perm) => {
        if (!permissionsMap[perm.user_id]) {
          permissionsMap[perm.user_id] = {
            userId: perm.user_id,
            pages: {},
            role: 'user'
          };
        }
        permissionsMap[perm.user_id].pages[perm.page_path] = perm.can_access;
      });

      // Agregar roles
      rolePermissions.forEach((role) => {
        if (!permissionsMap[role.user_id]) {
          permissionsMap[role.user_id] = {
            userId: role.user_id,
            pages: {},
            role: role.role
          };
        } else {
          permissionsMap[role.user_id].role = role.role;
        }
      });

      setUserPermissions(permissionsMap);
    }
  }, [pagePermissions, rolePermissions, profiles]);

  const handlePermissionChange = async (userId: string, page: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from("page_permissions")
        .upsert({
          user_id: userId,
          page_path: page,
          can_access: checked
        });

      if (error) throw error;

      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          pages: {
            ...prev[userId]?.pages,
            [page]: checked
          }
        }
      }));

      queryClient.invalidateQueries({ queryKey: ["page-permissions"] });
      toast.success("Permisos actualizados correctamente");
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast.error("Error al actualizar permisos: " + error.message);
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          role: role
        }
      }));

      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success("Rol actualizado correctamente");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol: " + error.message);
    }
  };

  const isLoading = isProfilesLoading || isPagePermissionsLoading || isRolePermissionsLoading;

  return {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange
  };
}
