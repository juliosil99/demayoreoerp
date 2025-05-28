
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useInvitationQueries() {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      console.log("📥 [QUERY] Fetching invitations from database...");
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          companies:company_id(id, nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ [QUERY] Error fetching invitations:", error);
        toast.error(`Error cargando invitaciones: ${error.message}`);
        throw error;
      }

      console.log("✅ [QUERY] Raw data from database:", data);
      console.log("🔍 [QUERY] Invitation IDs from database:", data.map(inv => ({ id: inv.id, email: inv.email, status: inv.status })));

      // Transform to add company_name field
      const transformedData = data.map((inv: any) => ({
        ...inv,
        company_name: inv.companies?.nombre || null
      }));

      console.log("🔄 [QUERY] Transformed invitations data:", transformedData);
      console.log("📊 [QUERY] Total invitations count:", transformedData.length);
      console.log("🆔 [QUERY] Final invitation IDs:", transformedData.map(inv => ({ id: inv.id, email: inv.email, status: inv.status })));
      
      return transformedData;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const invalidateInvitations = () => {
    console.log("🔄 [INVALIDATE] Manually invalidating invitations cache...");
    queryClient.invalidateQueries({ queryKey: ["invitations"] });
  };

  // Log whenever invitations data changes
  console.log("📋 [HOOK] Current invitations state:", {
    invitations,
    isLoading,
    error,
    count: invitations?.length || 0,
    invitationIds: invitations?.map(inv => ({ id: inv.id, email: inv.email, status: inv.status })) || []
  });

  return {
    invitations,
    isLoading,
    error,
    invalidateInvitations
  };
}
