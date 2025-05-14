
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useCompanyUsers() {
  const { data: companyUsers, isLoading: isCompanyUsersLoading } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_users")
        .select("*");

      if (error) {
        toast.error("Error al cargar roles de empresa: " + error.message);
        throw error;
      }
      return data;
    },
  });

  return { companyUsers, isLoading: isCompanyUsersLoading };
}
