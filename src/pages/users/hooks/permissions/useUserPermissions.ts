
import { useState, useEffect } from "react";
import { UserPermissions, Profile } from "../../types";
import { useProfiles } from "./useProfiles";
import { usePagePermissions } from "./usePagePermissions";
import { useCompanyUsers } from "./useCompanyUsers";
import { usePermissionMutations } from "./usePermissionMutations";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});
  
  // Fetch data using the extracted hooks
  const { 
    profiles, 
    isLoading: isProfilesLoading, 
    currentUserId,
    error: profilesError,
    refetch: refetchProfiles 
  } = useProfiles();
  
  const { 
    pagePermissions, 
    isLoading: isPagePermissionsLoading,
    error: pagePermissionsError,
    refetch: refetchPagePermissions
  } = usePagePermissions();
  
  const { 
    companyUsers, 
    isLoading: isCompanyUsersLoading,
    error: companyUsersError,
    refetch: refetchCompanyUsers
  } = useCompanyUsers();
  
  // Get mutation handlers
  const { handlePermissionChange, handleRoleChange } = usePermissionMutations(setUserPermissions);

  useEffect(() => {
    if (pagePermissions && companyUsers && profiles) {
      console.log("Building user permissions map...");
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
      companyUsers?.forEach((cu) => {
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

      console.log("User permissions map built:", permissionsMap);
      setUserPermissions(permissionsMap);
    }
  }, [pagePermissions, companyUsers, profiles]);

  const isLoading = isProfilesLoading || isPagePermissionsLoading || isCompanyUsersLoading;
  
  // Combine errors
  const error = profilesError || pagePermissionsError || companyUsersError;
  
  // Function to refetch all data
  const refetchData = () => {
    console.log("Refetching all user data...");
    refetchProfiles();
    refetchPagePermissions();
    refetchCompanyUsers();
  };

  return {
    profiles,
    isLoading,
    error,
    userPermissions,
    handlePermissionChange,
    handleRoleChange,
    currentUserId,
    refetchData
  };
}
