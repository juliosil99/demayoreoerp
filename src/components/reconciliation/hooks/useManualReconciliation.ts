
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
      if (!userId) {
        console.error("Error: Missing user ID for reconciliation");
        toast.error("Error de autenticación");
        return false;
      }
      
      console.log("=== MANUAL RECONCILIATION PROCESS STARTED ===");
      console.log(`Processing reconciliation for expense: ${expenseId}`);
      console.log("Reconciliation data:", JSON.stringify(data, null, 2));
      
      // First, verify the expense exists and its current reconciliation status
      const { data: expenseCheck, error: checkError } = await supabase
        .from("expenses")
        .select("id, reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();

      if (checkError) {
        console.error("Error checking expense:", checkError);
        toast.error("Error verificando gasto");
        return false;
      }

      console.log("Current expense status:", JSON.stringify(expenseCheck, null, 2));
      
      // Step 1: Create a manual reconciliation record
      console.log("Step 1: Creating manual reconciliation record...");
      
      const manualRecData = {
        expense_id: expenseId,
        user_id: userId,
        reconciliation_type: data.reconciliationType,
        reference_number: data.referenceNumber || null,
        notes: data.notes,
        file_id: data.fileId || null,
        chart_account_id: data.chartAccountId || null
      };
      
      console.log("Inserting record with data:", JSON.stringify(manualRecData, null, 2));

      const { data: newReconciliation, error: manualError } = await supabase
        .from("manual_reconciliations")
        .insert([manualRecData])
        .select();

      if (manualError) {
        console.error("Error creating manual reconciliation record:", manualError);
        toast.error("Error creando registro de reconciliación");
        return false;
      }
      
      console.log("Manual reconciliation record created:", newReconciliation);
      
      // Step 2: Manually update the expense to mark it as reconciled
      const now = new Date().toISOString();
      console.log(`Step 2: Updating expense ${expenseId} as reconciled at ${now}`);
      
      const updateData = { 
        reconciled: true,
        reconciliation_date: now,
        reconciliation_type: 'manual'
      };
      
      console.log("Updating expense with:", JSON.stringify(updateData, null, 2));
      
      const { data: updatedExpense, error: updateError } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", expenseId)
        .select();

      if (updateError) {
        console.error("Error updating expense reconciliation status:", updateError);
        toast.error("Error actualizando estado de reconciliación");
        return false;
      }
      
      console.log("Expense updated successfully:", updatedExpense);
      
      // Step 3: Verify the update worked
      console.log("Step 3: Verifying the update...");
      const { data: verifyUpdate, error: verifyError } = await supabase
        .from("expenses")
        .select("reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying update:", verifyError);
      } else {
        console.log("Verification result:", verifyUpdate);
        
        if (!verifyUpdate.reconciled) {
          console.error("WARNING: Expense still not marked as reconciled even after update!");
        }
      }
      
      // Step 4: Invalidate queries to refresh the UI
      console.log("Step 4: Invalidating queries to refresh UI...");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      
      console.log("=== MANUAL RECONCILIATION COMPLETED SUCCESSFULLY ===");
      
      toast.success("Gasto conciliado manualmente");
      return true;
    } catch (error) {
      console.error("Error en reconciliación manual:", error);
      toast.error("Error al reconciliar el gasto");
      return false;
    } finally {
      // Ensure UI refreshes by directly calling refetch on key queries
      console.log("Forcing refresh of expense data...");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: 'all' });
    }
  };

  return {
    showManualReconciliation,
    setShowManualReconciliation,
    chartAccounts,
    handleManualReconciliationConfirm,
  };
};
