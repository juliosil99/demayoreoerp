import { useState, useEffect } from "react";
import { UserPermissions, Profile, rolePermissions } from "../../types";
import { useProfiles } from "./useProfiles";
import { useCompanyUsers } from "./useCompanyUsers";
import { usePermissionMutations } from "./usePermissionMutations";

export function useSimplifiedPermissions() {
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
    if (profiles && companyUsers) {
      console.log("Building simplified user permissions map...");
      const permissionsMap: { [key: string]: UserPermissions } = {};
      
      // Filter out potential duplicates by email and ensure unique entries
      const uniqueProfiles = profiles.reduce((acc: Profile[], profile) => {
        const existing = acc.find(p => p.email === profile.email);
        if (!existing) {
          acc.push(profile);
        } else {
          // Keep the most recent profile if duplicates exist
          const profileDate = profile.created_at ? new Date(profile.created_at) : new Date(0);
          const existingDate = existing.created_at ? new Date(existing.created_at) : new Date(0);
          
          if (profileDate > existingDate) {
            const index = acc.indexOf(existing);
            acc[index] = profile;
          }
        }
        return acc;
      }, []);

      // Initialize with unique users only
      uniqueProfiles.forEach(profile => {
        const companyUser = companyUsers.find(cu => cu.user_id === profile.id);
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
    profiles: profiles?.reduce((acc: Profile[], profile) => {
      const existing = acc.find(p => p.email === profile.email);
      if (!existing) {
        acc.push(profile);
      } else {
        // Keep the most recent profile if duplicates exist
        const profileDate = profile.created_at ? new Date(profile.created_at) : new Date(0);
        const existingDate = existing.created_at ? new Date(existing.created_at) : new Date(0);
        
        if (profileDate > existingDate) {
          const index = acc.indexOf(existing);
          acc[index] = profile;
        }
      }
      return acc;
    }, []) || [],
    isLoading,
    error,
    userPermissions,
    handleRoleChange,
    currentUserId,
    refetchData
  };
}
