
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePaymentQueries() {
  const { data: bankAccounts } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("type", "client");
      if (error) throw error;
      return data;
    },
  });

  return {
    bankAccounts,
    clients,
  };
}
