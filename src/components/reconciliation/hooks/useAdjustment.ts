
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdjustment = (userId: string | undefined) => {
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"expense_excess" | "invoice_excess">("expense_excess");

  const handleAdjustmentConfirm = async (
    expenseId: string,
    invoiceId: number,
    chartAccountId: string,
    amount: number,
    type: "expense_excess" | "invoice_excess",
    notes: string
  ) => {
    try {
      if (!userId) throw new Error("User ID is required");
      
      console.log(`Creating adjustment: type=${type}, accountId=${chartAccountId}, amount=${amount}`);
      
      // Verify that the chart account exists and belongs to the user
      const { data: chartAccount, error: accountError } = await supabase
        .from("chart_of_accounts")
        .select("id, code, name")
        .eq("id", chartAccountId)
        .eq("user_id", userId)
        .single();

      if (accountError || !chartAccount) {
        console.error("Error verifying chart account:", accountError);
        throw new Error("La cuenta contable seleccionada no es válida");
      }

      console.log(`Using chart account: ${chartAccount.code} - ${chartAccount.name}`);
      
      // Create the accounting adjustment
      const { error: adjustmentError } = await supabase
        .from("accounting_adjustments")
        .insert([{
          user_id: userId,
          expense_id: expenseId,
          invoice_id: invoiceId,
          amount: Math.abs(amount),
          type: type,
          chart_account_id: chartAccountId,
          notes: notes
        }]);

      if (adjustmentError) {
        console.error("Error creating adjustment:", adjustmentError);
        throw adjustmentError;
      }
      
      toast.success(`Ajuste contable creado en cuenta: ${chartAccount.code} - ${chartAccount.name}`);
      return true;
    } catch (error) {
      console.error("Error al crear el ajuste:", error);
      toast.error("Error al crear el ajuste contable");
      return false;
    }
  };

  return {
    showAdjustmentDialog,
    setShowAdjustmentDialog,
    adjustmentType,
    setAdjustmentType,
    handleAdjustmentConfirm,
  };
};
