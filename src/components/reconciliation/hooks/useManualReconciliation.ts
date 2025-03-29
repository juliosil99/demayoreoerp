
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
      
      // Step 1: Create a manual reconciliation record
      console.log("Step 1: Creating manual reconciliation record with data:", {
        expense_id: expenseId,
        user_id: userId,
        reconciliation_type: data.reconciliationType,
        reference_number: data.referenceNumber || null,
        notes: data.notes,
        file_id: data.fileId || null,
        chart_account_id: data.chartAccountId || null
      });

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
      
      // Step 2: Manually update the expense to mark it as reconciled
      // We'll do this even though there's a trigger, to ensure it works
      const now = new Date().toISOString();
      console.log(`Step 2: Manually setting expense ${expenseId} as reconciled at ${now}`);
      
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
      
      // Step 3: Double-check if the update worked by refetching the expense
      console.log("Step 3: Verifying the expense update...");
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
      
      // Step 4: Invalidate queries to refresh the UI
      console.log("Step 4: Invalidating queries to refresh UI...");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      
      console.log("=== END DEBUG LOG ===");
      
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
