
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
  const { data: companyUsers, isLoading: isCompanyUsersLoading } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_users")
        .select("*, companies:company_id(id, nombre)");

      if (error) {
        toast({
          title: "Error",
          description: "Error al cargar roles de empresa: " + error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as CompanyUser[];
    },
  });

  return { companyUsers, isLoading: isCompanyUsersLoading };
}
