
import { useState, useEffect } from "react";
import { UserPermissions, Profile, rolePermissions } from "../../types";
import { useProfiles } from "./useProfiles";
import { useCompanyUsers } from "./useCompanyUsers";
import { usePermissionMutations } from "./usePermissionMutations";

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermissions }>({});
  
  const { 
    profiles, 
    isLoading: isProfilesLoading, 
    currentUserId,
    error: profilesError,
    refetch: refetchProfiles 
  } = useProfiles();
  
  const { 
    companyUsers, 
    isLoading: isCompanyUsersLoading,
    error: companyUsersError,
    refetch: refetchCompanyUsers
  } = useCompanyUsers();
  
  const { handleRoleChange } = usePermissionMutations(setUserPermissions);

  useEffect(() => {
    if (profiles) {
      console.log("Building simplified user permissions map...");
      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      // Initialize with all users
      profiles.forEach(profile => {
        const companyUser = companyUsers?.find(cu => cu.user_id === profile.id);
        const role = companyUser?.role || 'user';
        const basePermissions = rolePermissions[role];
        
        permissionsMap[profile.id] = {
          userId: profile.id,
          role,
          ...basePermissions
        };
      });

      console.log("Simplified permissions map built:", permissionsMap);
      setUserPermissions(permissionsMap);
    }
  }, [profiles, companyUsers]);

  const isLoading = isProfilesLoading || isCompanyUsersLoading;
  const error = profilesError || companyUsersError;
  
  const refetchData = () => {
    console.log("Refetching all user data...");
    refetchProfiles();
    refetchCompanyUsers();
  };

  return {
    profiles,
    isLoading,
    error,
    userPermissions,
    handleRoleChange,
    currentUserId,
    refetchData
  };
}
