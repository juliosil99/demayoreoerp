
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "../types";

// Define types for the auth users response
interface AuthUser {
  id: string;
  email?: string | null;
  user_metadata?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

interface AuthUsersResponse {
  users?: AuthUser[];
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching all user profiles...");
      
      try {
        // First, try to get all auth users (requires admin privileges)
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error fetching auth users:", authError);
          // Fall back to just getting profiles from the profiles table
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
        
        // Get existing profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          toast.error("Error al cargar usuarios: " + error.message);
          throw error;
        }
        
        console.log("Fetched profiles:", data);
        
        // Safely cast authUsers to our type
        const authUsersData = authUsers as AuthUsersResponse;
        
        // Check if there are auth users without profiles
        if (authUsersData?.users && authUsersData.users.length > data.length) {
          console.log("Some users don't have profiles, creating missing profiles...");
          
          const profileIds = data.map(profile => profile.id);
          const createdProfiles = [];
          
          // Create profiles for users that don't have them
          for (const user of authUsersData.users) {
            if (!user || !user.id || profileIds.includes(user.id)) continue;
            
            console.log(`Creating profile for user: ${user.id}`);
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || null,
                first_name: user.user_metadata?.first_name || null,
                last_name: user.user_metadata?.last_name || null,
              });
              
            if (insertError) {
              console.error(`Error creating profile for user ${user.id}:`, insertError);
            } else {
              createdProfiles.push({
                id: user.id,
                email: user.email || null,
                first_name: user.user_metadata?.first_name || null,
                last_name: user.user_metadata?.last_name || null,
              });
            }
          }
          
          if (createdProfiles.length > 0) {
            // If we created new profiles, get all profiles again
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
        }
        
        return data as Profile[];
      } catch (error) {
        console.error("Error in useProfiles:", error);
        toast.error("Error al cargar usuarios: " + (error as Error).message);
        return [];
      }
    },
  });
}
