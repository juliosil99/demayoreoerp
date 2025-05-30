
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface OldestExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  supplier_id: string | null;
  payment_method: string;
}

export const useOldestExpense = (reconciledExpenseIds: string[] = []) => {
  const [oldestExpense, setOldestExpense] = useState<OldestExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOldestExpense = async () => {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('expenses')
          .select(`
            id, 
            date, 
            description, 
            amount, 
            supplier_id, 
            payment_method,
            expense_invoice_relations!left(id)
          `)
          .is('expense_invoice_relations.id', null)
          .order('date', { ascending: true })
          .limit(1);
          
        const { data: oldestExpenseData, error: oldestExpenseError } = await query.maybeSingle();

        if (oldestExpenseError) {
          console.error("Error fetching oldest expense:", oldestExpenseError);
        } else {
          setOldestExpense(oldestExpenseData);
        }
      } catch (error) {
        console.error("Error in fetchOldestExpense:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOldestExpense();
  }, [reconciledExpenseIds]);

  return { oldestExpense, isLoading };
};
