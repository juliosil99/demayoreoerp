
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BankStatementsTable } from "@/integrations/supabase/types/bank-statements";

type BankStatement = BankStatementsTable['Row'];

export function useStatements(accountId: number, userId: string | undefined, refreshTrigger = 0) {
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bank statements
  useEffect(() => {
    const fetchStatements = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bank_statements")
          .select("*")
          .eq("account_id", accountId)
          .eq("user_id", userId)
          .order("year", { ascending: false })
          .order("month", { ascending: false });
        
        if (error) throw error;
        setStatements(data as BankStatement[] || []);
      } catch (error) {
        toast.error("Error al cargar los estados de cuenta");
        setStatements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [accountId, userId, refreshTrigger]);

  return { statements, loading, setStatements };
}
