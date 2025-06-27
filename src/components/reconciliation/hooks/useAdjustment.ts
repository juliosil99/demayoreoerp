
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
      
      console.log(`Creating adjustment: type=${type}, account=${adjustmentAccount.code}, amount=${amount}`);
      
      // Buscar o crear la cuenta contable con el código específico
      let { data: existingAccount, error: searchError } = await supabase
        .from("chart_of_accounts")
        .select("id")
        .eq("code", adjustmentAccount.code)
        .eq("user_id", userId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error("Error searching for chart account:", searchError);
        throw searchError;
      }

      let accountId: string;
      
      if (!existingAccount) {
        // Crear la cuenta si no existe
        const { data: newAccount, error: createError } = await supabase
          .from("chart_of_accounts")
          .insert([{
            code: adjustmentAccount.code,
            name: adjustmentAccount.name,
            account_type: type === "expense_excess" ? "asset" : "liability",
            level: 1,
            user_id: userId
          }])
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating chart account:", createError);
          throw createError;
        }

        accountId = newAccount.id;
        console.log(`Created new chart account: ${adjustmentAccount.code} with ID: ${accountId}`);
      } else {
        accountId = existingAccount.id;
        console.log(`Using existing chart account: ${adjustmentAccount.code} with ID: ${accountId}`);
      }
      
      const { error: adjustmentError } = await supabase
        .from("accounting_adjustments")
        .insert([{
          user_id: userId,
          expense_id: expenseId,
          invoice_id: invoiceId,
          amount: Math.abs(amount),
          type: type,
          chart_account_id: accountId, // Usar el ID real de la cuenta
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
