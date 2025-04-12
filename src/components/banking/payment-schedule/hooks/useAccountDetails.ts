
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BankAccount } from "@/components/banking/types";

export function useAccountDetails() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const {
    data: account,
    isLoading: isLoadingAccount,
    error: accountError
  } = useQuery({
    queryKey: ["bank-account", Number(accountId)],
    queryFn: async () => {
      if (!accountId) return null;
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", parseInt(accountId))
        .single();
        
      if (error) throw error;
      return data as BankAccount;
    },
    enabled: !!accountId
  });

  return {
    accountId,
    account,
    isLoadingAccount,
    accountError,
    navigate
  };
}
