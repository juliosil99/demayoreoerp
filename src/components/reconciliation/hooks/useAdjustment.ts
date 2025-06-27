
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ADJUSTMENT_ACCOUNTS } from "../constants";

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
      
      // Usar la cuenta correcta según el tipo de ajuste
      const adjustmentAccount = ADJUSTMENT_ACCOUNTS[type];
      const accountCodeToUse = chartAccountId || adjustmentAccount.code;
      
      console.log(`Creating adjustment: type=${type}, account=${accountCodeToUse}, amount=${amount}`);
      
      const { error: adjustmentError } = await supabase
        .from("accounting_adjustments")
        .insert([{
          user_id: userId,
          expense_id: expenseId,
          invoice_id: invoiceId,
          amount: Math.abs(amount),
          type: type,
          chart_account_id: accountCodeToUse, // Usar código de cuenta como ID temporal
          notes: notes || `Ajuste automático: ${adjustmentAccount.description}`
        }]);

      if (adjustmentError) {
        console.error("Error creating adjustment:", adjustmentError);
        throw adjustmentError;
      }
      
      toast.success(`Ajuste contable creado: ${adjustmentAccount.code} - ${adjustmentAccount.name}`);
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
