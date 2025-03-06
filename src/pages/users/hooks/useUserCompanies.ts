
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserCompanies() {
  return useQuery({
    queryKey: ["user-companies"],
    queryFn: async () => {
      // Fetch all company-user relationships
      const { data: companyUsers, error: cuError } = await supabase
        .from("company_users")
        .select(`
          user_id,
          role,
          company:company_id (
            id,
            nombre
          )
        `);

      if (cuError) {
        console.error("Error fetching company users:", cuError);
        throw cuError;
      }

      // Transform data to user-centric structure
      const userCompaniesMap: { 
        [userId: string]: { companyName: string; role: string }[] 
      } = {};

      companyUsers?.forEach(item => {
        if (item.user_id && item.company) {
          if (!userCompaniesMap[item.user_id]) {
            userCompaniesMap[item.user_id] = [];
          }
          
          userCompaniesMap[item.user_id].push({
            companyName: item.company.nombre,
            role: item.role
          });
        }
      });

      return userCompaniesMap;
    }
  });
}
