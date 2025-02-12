
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPermissions, Profile } from "../types";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});

  const { data: profiles, isLoading } = useQuery({
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

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data: pagePerms, error: pageError } = await supabase
        .from("page_permissions")
        .select("*");
      
      const { data: rolePerms, error: roleError } = await supabase
        .from("user_roles")
        .select("*");

      if (pageError) {
        toast.error("Error al cargar permisos de página: " + pageError.message);
        throw pageError;
      }
      if (roleError) {
        toast.error("Error al cargar roles: " + roleError.message);
        throw roleError;
      }

      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      pagePerms?.forEach((perm) => {
        if (!permissionsMap[perm.user_id]) {
          permissionsMap[perm.user_id] = {
            userId: perm.user_id,
            pages: {},
            role: 'user'
          };
        }
        permissionsMap[perm.user_id].pages[perm.page_path] = perm.can_access;
      });

      rolePerms?.forEach((role) => {
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
      return permissionsMap;
    },
  });

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

      toast.success("Permisos actualizados");
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

      toast.success("Rol actualizado");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol: " + error.message);
    }
  };

  return {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange
  };
}
