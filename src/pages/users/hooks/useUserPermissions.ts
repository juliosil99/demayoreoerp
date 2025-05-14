
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserPermissions, Profile, CompanyUser } from "../types";
import { useAuth } from "@/contexts/AuthContext";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: isProfilesLoading } = useQuery({
    queryKey: ["profiles-with-companies"],
    queryFn: async () => {
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        toast.error("Error al cargar usuarios: " + profilesError.message);
        throw profilesError;
      }

      // Get company-user relationships
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('*, companies:company_id(id, nombre)');
      
      if (companyUsersError) {
        toast.error("Error al cargar relaciones de empresa: " + companyUsersError.message);
        throw companyUsersError;
      }

      // Map company info to profiles
      const enrichedProfiles = profilesData.map((profile: Profile) => {
        const userCompany = companyUsers.find((cu: any) => cu.user_id === profile.id);
        return {
          ...profile,
          company: userCompany ? {
            id: userCompany.companies.id,
            nombre: userCompany.companies.nombre,
          } : null,
          isCurrentUser: profile.id === currentUser?.id
        };
      });

      return enrichedProfiles as Profile[];
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

  const { data: companyUsers, isLoading: isCompanyUsersLoading } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_users")
        .select("*");

      if (error) {
        toast.error("Error al cargar roles de empresa: " + error.message);
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    if (pagePermissions && companyUsers && profiles) {
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

      // Agregar roles desde company_users
      companyUsers.forEach((cu) => {
        if (!permissionsMap[cu.user_id]) {
          permissionsMap[cu.user_id] = {
            userId: cu.user_id,
            pages: {},
            role: cu.role as 'admin' | 'user'
          };
        } else {
          permissionsMap[cu.user_id].role = cu.role as 'admin' | 'user';
        }
      });

      setUserPermissions(permissionsMap);
    }
  }, [pagePermissions, companyUsers, profiles]);

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
      // Find the company user relationship
      const { data: userCompany, error: findError } = await supabase
        .from("company_users")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (findError && findError.code !== 'PGRST116') { // Not found error
        throw findError;
      }

      // If found, update the role
      if (userCompany) {
        const { error } = await supabase
          .from("company_users")
          .update({ role })
          .eq("id", userCompany.id);

        if (error) throw error;
      } else {
        // This shouldn't happen in the updated system, but as a fallback
        // update the user_roles table
        const { error } = await supabase
          .from("user_roles")
          .upsert({
            user_id: userId,
            role: role
          });

        if (error) throw error;
      }

      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          role: role
        }
      }));

      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      toast.success("Rol actualizado correctamente");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol: " + error.message);
    }
  };

  const isLoading = isProfilesLoading || isPagePermissionsLoading || isCompanyUsersLoading;

  return {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange,
    currentUserId: currentUser?.id
  };
}
