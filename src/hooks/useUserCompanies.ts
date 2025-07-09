import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Company {
  id: string;
  nombre: string;
  rfc: string;
  regimen_fiscal: string;
  codigo_postal: string;
  direccion?: string;
  telefono?: string;
  created_at?: string;
  user_id: string;
}

export function useUserCompanies() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-companies", user?.id],
    queryFn: async (): Promise<Company[]> => {
      if (!user?.id) {
        return [];
      }

      // Get companies where user is owner
      const { data: ownedCompanies, error: ownedError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id);

      // Get companies where user is member
      const { data: memberCompanies, error: memberError } = await supabase
        .from("company_users")
        .select("companies(*)")
        .eq("user_id", user.id);

      if (ownedError) throw ownedError;
      if (memberError) throw memberError;

      const allCompanies: Company[] = [
        ...(ownedCompanies || []),
        ...(memberCompanies?.map((cu: any) => cu.companies) || []).filter(Boolean)
      ];

      // Remove duplicates
      const uniqueCompanies = allCompanies.filter((company, index, self) => 
        index === self.findIndex(c => c.id === company.id)
      );

      return uniqueCompanies;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}