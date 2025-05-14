
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useCompanyUsers() {
  const { 
    data: companyUsers,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["company_users"],
    queryFn: async () => {
      console.log("Fetching company users...");
      
      // First get current user's company
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user:", userError);
        throw userError;
      }
      
      if (!userData?.user?.id) {
        console.error("No user found");
        return [];
      }

      // Get company for current user
      const { data: userCompany, error: companyError } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", userData.user.id)
        .single();
        
      if (companyError && companyError.code !== 'PGRST116') {
        console.error("Error fetching user's company:", companyError);
        toast.error("Error al cargar datos de empresa");
        throw companyError;
      }
      
      if (!userCompany?.company_id) {
        // Try to get company where user is the owner
        const { data: ownedCompany, error: ownedError } = await supabase
          .from("companies")
          .select("id")
          .eq("user_id", userData.user.id)
          .single();
          
        if (ownedError && ownedError.code !== 'PGRST116') {
          console.error("Error fetching owned company:", ownedError);
          throw ownedError;
        }
        
        if (!ownedCompany?.id) {
          console.log("No company found for user");
          return [];
        }
        
        // Fetch all company users for this company
        const { data: companyUsers, error: usersError } = await supabase
          .from("company_users")
          .select("*")
          .eq("company_id", ownedCompany.id);
        
        if (usersError) {
          console.error("Error fetching company users:", usersError);
          throw usersError;
        }
        
        return companyUsers;
      }
      
      // Fetch all company users for this company
      const { data: companyUsers, error: usersError } = await supabase
        .from("company_users")
        .select("*")
        .eq("company_id", userCompany.company_id);
      
      if (usersError) {
        console.error("Error fetching company users:", usersError);
        throw usersError;
      }
      
      return companyUsers;
    },
    retry: 1,
    retryDelay: 1000,
    // Removed the useErrorBoundary option which was causing the error
  });

  return { 
    companyUsers, 
    isLoading, 
    error,
    refetch
  };
}
