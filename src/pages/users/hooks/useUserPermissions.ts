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
      console.log("Fetching all user profiles...");
      
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          toast.error("Error al cargar usuarios: " + error.message);
          throw error;
        }
        
        console.log("Fetched profiles directly:", data);
        return data as Profile[];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        toast.error("Error al cargar usuarios: " + error.message);
        throw error;
      }
      
      console.log("Fetched profiles:", data);
      
      if (authUsers?.users && authUsers.users.length > data.length) {
        console.log("Some users don't have profiles, creating missing profiles...");
        
        const profileIds = data.map(profile => profile.id);
        const missingUsers = authUsers.users.filter(user => !profileIds.includes(user.id));
        
        for (const user of missingUsers) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || null,
              last_name: user.user_metadata?.last_name || null,
            });
            
          if (insertError) {
            console.error("Error creating profile for user:", insertError);
          }
        }
        
        const { data: updatedProfiles, error: refetchError } = await supabase
          .from('profiles')
          .select('*');
          
        if (refetchError) {
          toast.error("Error al recargar perfiles: " + refetchError.message);
          throw refetchError;
        }
        
        console.log("Updated profiles list:", updatedProfiles);
        return updatedProfiles as Profile[];
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
    if (profiles && (pagePermissions || rolePermissions)) {
      console.log("Building permissions map with profiles:", profiles);
      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      profiles?.forEach(profile => {
        if (!permissionsMap[profile.id]) {
          permissionsMap[profile.id] = {
            userId: profile.id,
            pages: {},
            role: 'user'
          };
        }
      });
      
      pagePermissions?.forEach((perm) => {
        if (!permissionsMap[perm.user_id]) {
          permissionsMap[perm.user_id] = {
            userId: perm.user_id,
            pages: {},
            role: 'user'
          };
        }
        permissionsMap[perm.user_id].pages[perm.page_path] = perm.can_access;
      });

      rolePermissions?.forEach((role) => {
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

      console.log("Final permissions map:", permissionsMap);
      setUserPermissions(permissionsMap);
    }
  }, [pagePermissions, rolePermissions, profiles]);

  const handlePermissionChange = async (userId: string, page: string, checked: boolean) => {
    try {
      console.log(`Updating permission for user ${userId}, page ${page} to ${checked}`);
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
      console.log(`Updating role for user ${userId} to ${role}`);
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
