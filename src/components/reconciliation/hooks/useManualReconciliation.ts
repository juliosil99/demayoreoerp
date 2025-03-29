
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useManualReconciliation = (userId: string | undefined) => {
  const [showManualReconciliation, setShowManualReconciliation] = useState(false);
  const queryClient = useQueryClient();

  // Fetch chart of accounts for manual reconciliation
  const { data: chartAccounts } = useQuery({
    queryKey: ["chart-accounts-basic"],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('id, name, code')
        .eq('user_id', userId)
        .order('code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleManualReconciliationConfirm = async (
    expenseId: string,
    data: {
      reconciliationType: string;
      referenceNumber?: string;
      notes: string;
      fileId?: string;
      chartAccountId?: string;
    }
  ) => {
    try {
      if (!userId) throw new Error("User ID is required");
      
      console.log("Starting manual reconciliation process for expense:", expenseId);
      
      // Create a manual reconciliation record
      const { error: manualError } = await supabase
        .from("manual_reconciliations")
        .insert([{
          expense_id: expenseId,
          user_id: userId,
          reconciliation_type: data.reconciliationType,
          reference_number: data.referenceNumber || null,
          notes: data.notes,
          file_id: data.fileId || null,
          chart_account_id: data.chartAccountId || null
        }]);

      if (manualError) {
        console.error("Error creating manual reconciliation record:", manualError);
        throw manualError;
      }
      
      // Update the expense to mark it as reconciled
      const { error: updateError } = await supabase
        .from("expenses")
        .update({ 
          reconciled: true,
          reconciliation_date: new Date().toISOString(),
          reconciliation_type: 'manual'
        })
        .eq("id", expenseId);

      if (updateError) {
        console.error("Error updating expense reconciliation status:", updateError);
        throw updateError;
      }

      console.log("Expense successfully reconciled manually:", expenseId);
      
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      
      toast.success("Gasto conciliado manualmente");
      return true;
    } catch (error) {
      console.error("Error al reconciliar manualmente:", error);
      toast.error("Error al reconciliar el gasto");
      return false;
    }
  };

  return {
    showManualReconciliation,
    setShowManualReconciliation,
    chartAccounts,
    handleManualReconciliationConfirm,
  };
};
