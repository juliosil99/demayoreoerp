
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
      
      console.log("[useManualReconciliation] Fetching chart accounts for user:", userId);
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('id, name, code')
        .eq('user_id', userId)
        .order('code');
      
      if (error) {
        console.error("[useManualReconciliation] Error fetching chart accounts:", error);
        throw error;
      }
      console.log(`[useManualReconciliation] Fetched ${data?.length || 0} chart accounts`);
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
        console.error("[useManualReconciliation] Error: Missing user ID for reconciliation");
        toast.error("Error de autenticación");
        return false;
      }
      
      console.log("=====================================================");
      console.log("[useManualReconciliation] MANUAL RECONCILIATION PROCESS STARTED");
      console.log(`[useManualReconciliation] Processing reconciliation for expense ID: ${expenseId}`);
      console.log("[useManualReconciliation] Reconciliation data:", JSON.stringify(data, null, 2));
      
      // First, verify the expense exists and its current reconciliation status
      console.log("[useManualReconciliation] Step 0: Verifying expense exists...");
      const { data: expenseCheck, error: checkError } = await supabase
        .from("expenses")
        .select("id, reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();

      if (checkError) {
        console.error("[useManualReconciliation] Error checking expense:", checkError);
        toast.error("Error verificando gasto");
        return false;
      }

      console.log("[useManualReconciliation] Current expense status:", JSON.stringify(expenseCheck, null, 2));
      
      // Step 1: Create a manual reconciliation record
      console.log("[useManualReconciliation] Step 1: Creating manual reconciliation record...");
      
      const manualRecData = {
        expense_id: expenseId,
        user_id: userId,
        reconciliation_type: data.reconciliationType,
        reference_number: data.referenceNumber || null,
        notes: data.notes,
        file_id: data.fileId || null,
        chart_account_id: data.chartAccountId || null
      };
      
      console.log("[useManualReconciliation] Inserting record with data:", JSON.stringify(manualRecData, null, 2));

      const { data: newReconciliation, error: manualError } = await supabase
        .from("manual_reconciliations")
        .insert([manualRecData])
        .select();

      if (manualError) {
        console.error("[useManualReconciliation] Error creating manual reconciliation record:", manualError);
        toast.error("Error creando registro de reconciliación");
        return false;
      }
      
      console.log("[useManualReconciliation] Manual reconciliation record created:", JSON.stringify(newReconciliation, null, 2));
      
      // Step 2: Manually update the expense to mark it as reconciled
      const now = new Date().toISOString();
      console.log(`[useManualReconciliation] Step 2: Updating expense ${expenseId} as reconciled at ${now}`);
      
      const updateData = { 
        reconciled: true,
        reconciliation_date: now,
        reconciliation_type: 'manual'
      };
      
      console.log("[useManualReconciliation] Updating expense with:", JSON.stringify(updateData, null, 2));
      
      const { data: updatedExpense, error: updateError } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", expenseId)
        .select();

      if (updateError) {
        console.error("[useManualReconciliation] Error updating expense reconciliation status:", updateError);
        toast.error("Error actualizando estado de reconciliación");
        return false;
      }
      
      console.log("[useManualReconciliation] Expense updated successfully:", JSON.stringify(updatedExpense, null, 2));
      
      // Step 3: Verify the update worked
      console.log("[useManualReconciliation] Step 3: Verifying the update...");
      const { data: verifyUpdate, error: verifyError } = await supabase
        .from("expenses")
        .select("reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();
        
      if (verifyError) {
        console.error("[useManualReconciliation] Error verifying update:", verifyError);
      } else {
        console.log("[useManualReconciliation] Verification result:", JSON.stringify(verifyUpdate, null, 2));
        
        if (!verifyUpdate.reconciled) {
          console.error("[useManualReconciliation] WARNING: Expense still not marked as reconciled even after update!");
        }
      }
      
      // Step 4: Invalidate queries and refetch to refresh the UI
      console.log("[useManualReconciliation] Step 4: Invalidating queries to refresh UI...");
      
      // Using a stronger approach to invalidate and force refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
      ]);
      
      // Force refetch after a small delay to ensure DB updates are complete
      setTimeout(async () => {
        console.log("[useManualReconciliation] Force refreshing data...");
        await queryClient.refetchQueries({ queryKey: ["unreconciled-expenses"] });
        await queryClient.refetchQueries({ queryKey: ["expenses"] });
      }, 500);
      
      console.log("[useManualReconciliation] MANUAL RECONCILIATION COMPLETED SUCCESSFULLY");
      console.log("=====================================================");
      
      toast.success("Gasto conciliado manualmente");
      return true;
    } catch (error) {
      console.error("[useManualReconciliation] Unexpected error in reconciliation process:", error);
      toast.error("Error al reconciliar el gasto");
      return false;
    }
  };

  return {
    showManualReconciliation,
    setShowManualReconciliation: (value: boolean) => {
      console.log(`[useManualReconciliation] Setting showManualReconciliation to ${value}`);
      setShowManualReconciliation(value);
    },
    chartAccounts,
    handleManualReconciliationConfirm,
  };
};
