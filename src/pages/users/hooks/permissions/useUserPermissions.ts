
import { useState, useEffect } from "react";
import { UserPermissions, Profile } from "../../types";
import { useProfiles } from "./useProfiles";
import { usePagePermissions } from "./usePagePermissions";
import { useCompanyUsers } from "./useCompanyUsers";
import { usePermissionMutations } from "./usePermissionMutations";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});
  
  // Fetch data using the extracted hooks
  const { profiles, isLoading: isProfilesLoading, currentUserId } = useProfiles();
  const { pagePermissions, isLoading: isPagePermissionsLoading } = usePagePermissions();
  const { companyUsers, isLoading: isCompanyUsersLoading } = useCompanyUsers();
  
  // Get mutation handlers
  const { handlePermissionChange, handleRoleChange } = usePermissionMutations(setUserPermissions);

  useEffect(() => {
    if (pagePermissions && companyUsers && profiles) {
      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      // Initialize with all users
      profiles?.forEach(profile => {
        if (!permissionsMap[profile.id]) {
          permissionsMap[profile.id] = {
            userId: profile.id,
            pages: {},
            role: 'user'
          };
        }
      });
      
      // Add page permissions
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

      // Add roles from company_users
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

  const isLoading = isProfilesLoading || isPagePermissionsLoading || isCompanyUsersLoading;

  return {
    profiles,
    isLoading,
    userPermissions,
    handlePermissionChange,
    handleRoleChange,
    currentUserId
  };
}
