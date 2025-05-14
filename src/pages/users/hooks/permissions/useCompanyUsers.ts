
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  created_at: string | null;
  companies?: {
    id: string;
    nombre: string;
  };
}

export function useCompanyUsers() {
  const { data: companyUsers, isLoading: isCompanyUsersLoading, error, refetch } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      console.log("Fetching company users...");
      const { data, error } = await supabase
        .from("company_users")
        .select("*, companies:company_id(id, nombre)");

      if (error) {
        console.error("Error fetching company users:", error);
        toast({
          title: "Error",
          description: "Error al cargar roles de empresa: " + error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Company users fetched successfully:", data);
      return data as CompanyUser[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  return { 
    companyUsers, 
    isLoading: isCompanyUsersLoading, 
    error,
    refetch
  };
}
