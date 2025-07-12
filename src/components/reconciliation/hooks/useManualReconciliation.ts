import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useChartOfAccounts } from "@/components/chart-of-accounts/hooks/useChartOfAccounts";

export const useManualReconciliation = (userId: string | undefined) => {
  const [showManualReconciliation, setShowManualReconciliation] = useState(false);
  const queryClient = useQueryClient();

  // Use the centralized chart of accounts hook that includes global accounts
  const { data: chartAccounts } = useChartOfAccounts(userId);

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
        toast.error("Error de autenticación");
        return false;
      }
      
      // First, verify the expense exists and its current reconciliation status
      const { data: expenseCheck, error: checkError } = await supabase
        .from("expenses")
        .select("id, reconciled, reconciliation_date, reconciliation_type")
        .eq("id", expenseId)
        .single();

      if (checkError) {
        toast.error("Error verificando gasto");
        return false;
      }
      
      // Step 1: Create a manual reconciliation record
      const manualRecData = {
        expense_id: expenseId,
        user_id: userId,
        reconciliation_type: data.reconciliationType,
        reference_number: data.referenceNumber || null,
        notes: data.notes,
        file_id: data.fileId || null,
        chart_account_id: data.chartAccountId || null
      };

      const { error: manualError } = await supabase
        .from("manual_reconciliations")
        .insert([manualRecData])
        .select();

      if (manualError) {
        toast.error("Error creando registro de reconciliación");
        return false;
      }
      
      // Step 2: Manually update the expense to mark it as reconciled
      const now = new Date().toISOString();
      const updateData = { 
        reconciled: true,
        reconciliation_date: now,
        reconciliation_type: 'manual'
      };
      
      const { error: updateError } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", expenseId)
        .select();

      if (updateError) {
        toast.error("Error actualizando estado de reconciliación");
        return false;
      }
      
      // Step 4: Invalidate queries and refetch to refresh the UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
      ]);
      
      // Force refetch after a small delay to ensure DB updates are complete
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["unreconciled-expenses"] });
        await queryClient.refetchQueries({ queryKey: ["expenses"] });
      }, 500);
      
      toast.success("Gasto conciliado manualmente");
      return true;
    } catch (error) {
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
