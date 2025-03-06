
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
    // Only process if profiles data is available
    if (profiles?.length > 0) {
      console.log("Building permissions map with profiles:", profiles);
      console.log("Page permissions data:", pagePermissions || []);
      console.log("Role permissions data:", rolePermissions || []);
      
      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      // First, create base entries for all profiles
      profiles.forEach(profile => {
        if (profile && profile.id) {
          permissionsMap[profile.id] = {
            userId: profile.id,
            pages: {},
            role: 'user' // Default role
          };
        }
      });
      
      // Then apply page permissions if available
      if (pagePermissions?.length > 0) {
        pagePermissions.forEach((perm) => {
          if (perm && perm.user_id && permissionsMap[perm.user_id]) {
            permissionsMap[perm.user_id].pages[perm.page_path] = perm.can_access;
          }
        });
      }

      // Finally apply role permissions if available
      if (rolePermissions?.length > 0) {
        rolePermissions.forEach((role) => {
          if (role && role.user_id && permissionsMap[role.user_id]) {
            permissionsMap[role.user_id].role = role.role;
          }
        });
      }

      console.log("Final permissions map:", permissionsMap);
      setUserPermissions(permissionsMap);
    } else {
      console.log("No profiles available to build permissions map.");
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
