
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
      
      const { error: adjustmentError } = await supabase
        .from("accounting_adjustments")
        .insert([{
          user_id: userId,
          expense_id: expenseId,
          invoice_id: invoiceId,
          amount: Math.abs(amount),
          type: type,
          chart_account_id: chartAccountId,
          notes
        }]);

      if (adjustmentError) throw adjustmentError;
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
