
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Account {
  id: string;
  code: string;
  name: string;
  account_type: string;
  sat_code: string | null;
  account_use: string | null;
  parent_id: string | null;
  is_group: boolean;
  level: number;
  path: string;
}

export function useDeleteAccount(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Account) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', account.id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account");
    },
  });
}
