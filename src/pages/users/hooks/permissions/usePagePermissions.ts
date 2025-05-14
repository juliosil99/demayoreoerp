
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface PagePermission {
  id: string;
  user_id: string;
  page_path: string;
  can_access: boolean;
  created_at: string | null;
}

export function usePagePermissions() {
  const { 
    data: pagePermissions, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["page-permissions"],
    queryFn: async () => {
      console.log("Fetching page permissions...");
      const { data, error } = await supabase
        .from("page_permissions")
        .select("*");

      if (error) {
        console.error("Error fetching page permissions:", error);
        toast({
          title: "Error",
          description: "Error al cargar permisos de página: " + error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Page permissions fetched successfully:", data);
      return data as PagePermission[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  return { pagePermissions, isLoading, error, refetch };
}
