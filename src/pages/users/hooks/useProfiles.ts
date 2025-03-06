
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "../types";

export function useProfiles() {
  return useQuery({
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
      
      // Create missing profiles for users that exist in auth but not in profiles
      if (authUsers?.users && authUsers.users.length > data.length) {
        console.log("Some users don't have profiles, creating missing profiles...");
        
        const profileIds = data.map(profile => profile.id);
        
        // Safely filter users by checking for proper structure
        const missingUsers = authUsers.users.filter(user => {
          return user && typeof user === 'object' && 'id' in user && 
            typeof user.id === 'string' && !profileIds.includes(user.id);
        });
        
        for (const user of missingUsers) {
          // We've already filtered, so TypeScript should know user has an id property
          // But we'll add an extra check just to be safe
          if (user && typeof user === 'object' && 'id' in user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || null,
                first_name: user.user_metadata?.first_name || null,
                last_name: user.user_metadata?.last_name || null,
              });
              
            if (insertError) {
              console.error("Error creating profile for user:", insertError);
            }
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
}
