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
      
      console.log("=== MANUAL RECONCILIATION DEBUG LOG ===");
      console.log(`Starting manual reconciliation process for expense: ${expenseId}`);
      console.log("Reconciliation data:", JSON.stringify(data, null, 2));
      
      // First, verify the expense exists and its current reconciliation status
      const { data: expenseCheck, error: checkError } = await supabase
        .from("expenses")
        .select("id, reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();

      if (checkError) {
        console.error("Error checking expense:", checkError);
        throw checkError;
      }

      console.log("Current expense status:", JSON.stringify(expenseCheck, null, 2));
      
      // Create a manual reconciliation record
      const { data: newReconciliation, error: manualError } = await supabase
        .from("manual_reconciliations")
        .insert([{
          expense_id: expenseId,
          user_id: userId,
          reconciliation_type: data.reconciliationType,
          reference_number: data.referenceNumber || null,
          notes: data.notes,
          file_id: data.fileId || null,
          chart_account_id: data.chartAccountId || null
        }])
        .select();

      if (manualError) {
        console.error("Error creating manual reconciliation record:", manualError);
        throw manualError;
      }
      
      console.log("Manual reconciliation record created:", JSON.stringify(newReconciliation, null, 2));
      
      // Update the expense to mark it as reconciled
      // Note: This should be done by the database trigger now, but we'll keep the code
      // for backwards compatibility and to verify the trigger is working
      const now = new Date().toISOString();
      console.log(`Attempting to set expense ${expenseId} as reconciled at ${now}`);
      
      const { data: updatedExpense, error: updateError } = await supabase
        .from("expenses")
        .update({ 
          reconciled: true,
          reconciliation_date: now,
          reconciliation_type: 'manual'
        })
        .eq("id", expenseId)
        .select();

      if (updateError) {
        console.error("Error updating expense reconciliation status:", updateError);
        throw updateError;
      }
      
      // Double-check if the update worked
      const { data: verifyUpdate, error: verifyError } = await supabase
        .from("expenses")
        .select("reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying update:", verifyError);
      } else {
        console.log("Verification of updated expense:", JSON.stringify(verifyUpdate, null, 2));
      }
      
      console.log("Expense successfully updated:", JSON.stringify(updatedExpense, null, 2));
      console.log("Manual reconciliation complete for expense:", expenseId);
      console.log("=== END DEBUG LOG ===");
      
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
