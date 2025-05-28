
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useInvitationQueries() {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          companies:company_id(id, nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Error cargando invitaciones: ${error.message}`);
        throw error;
      }

      // Transform to add company_name field
      const transformedData = data.map((inv: any) => ({
        ...inv,
        company_name: inv.companies?.nombre || null
      }));
      
      return transformedData;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const invalidateInvitations = () => {
    queryClient.invalidateQueries({ queryKey: ["invitations"] });
  };

  return {
    invitations,
    isLoading,
    error,
    invalidateInvitations
  };
}
