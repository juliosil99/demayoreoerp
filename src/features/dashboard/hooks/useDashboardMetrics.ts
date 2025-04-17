import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DashboardMetrics } from "../types";

export function useDashboardMetrics() {
  const { user } = useAuth();

  const { data: metrics, isLoading: loading } = useQuery({
    queryKey: ["dashboard-metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from<"dashboard_metrics", "public">("dashboard_metrics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching dashboard metrics:", error);
        throw error;
      }

      return data as DashboardMetrics;
    },
    enabled: !!user
  });

  return { metrics, loading };
}
