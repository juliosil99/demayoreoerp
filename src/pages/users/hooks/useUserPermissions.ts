
import { useState, useEffect } from "react";
import { UserPermissions } from "../types";
import { useProfiles } from "./useProfiles";
import { usePagePermissions } from "./usePagePermissions";
import { useRolePermissions } from "./useRolePermissions";
import { usePermissionMutations } from "./usePermissionMutations";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});
  
  const { data: profiles, isLoading: isProfilesLoading } = useProfiles();
  const { data: pagePermissions, isLoading: isPagePermissionsLoading } = usePagePermissions();
  const { data: rolePermissions, isLoading: isRolePermissionsLoading } = useRolePermissions();
  const { handlePermissionChange, handleRoleChange } = usePermissionMutations();

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

  const isLoading = isProfilesLoading || isPagePermissionsLoading || isRolePermissionsLoading;

  return {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange
  };
}
