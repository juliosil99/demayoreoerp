
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function usePagePermissions() {
  const { data: pagePermissions, isLoading: isPagePermissionsLoading } = useQuery({
    queryKey: ["page-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_permissions")
        .select("*");
      
      if (error) {
        toast.error("Error al cargar permisos de página: " + error.message);
        throw error;
      }
      return data;
    },
  });

  return { pagePermissions, isLoading: isPagePermissionsLoading };
}
