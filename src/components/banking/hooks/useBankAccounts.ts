
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useBankAccounts() {
  const { data: accounts } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return { accounts };
}
