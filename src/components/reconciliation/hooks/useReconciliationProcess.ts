
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useReconciliationProcess = (
  userId: string | undefined,
  resetSelections: () => void,
) => {
  const queryClient = useQueryClient();

  const handleReconcile = async (expense: any, invoicesToReconcile: any[]) => {
    try {
      if (!userId || !expense) return false;
      
      let remainingExpenseAmount = expense.amount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        // For credit notes (type E), subtract the amount instead of adding it
        const reconciliationAmount = invoice.invoice_type === 'E' 
          ? -Math.min(remainingExpenseAmount, -invoice.total_amount) // Negative for credit notes
          : Math.min(remainingExpenseAmount, invoice.total_amount);
          
        const { error: relationError } = await supabase
          .from("expense_invoice_relations")
          .insert([{
            expense_id: expense.id,
            invoice_id: invoice.id,
            reconciled_amount: Math.abs(reconciliationAmount), // Store absolute value
            paid_amount: Math.abs(reconciliationAmount) // Store absolute value
          }]);

        if (relationError) throw relationError;

        // Update invoice paid amount 
        // For credit notes, we're adding a negative amount (reducing the paid amount)
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: invoice.paid_amount + Math.abs(reconciliationAmount),
            // A credit note is completely processed when its full negative amount is reconciled
            processed: Math.abs(reconciliationAmount) === Math.abs(invoice.total_amount)
          })
          .eq("id", invoice.id);

        if (invoiceError) throw invoiceError;

        // Adjust the remaining expense amount (credit notes increase the remaining amount)
        remainingExpenseAmount -= reconciliationAmount;
      }
      
      // Update the expense to mark it as reconciled
      const { error: updateError } = await supabase
        .from("expenses")
        .update({ 
          reconciled: true,
          reconciliation_date: new Date().toISOString(),
          reconciliation_type: 'automatic'
        })
        .eq("id", expense.id);

      if (updateError) throw updateError;

      toast.success("Gasto conciliado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
      resetSelections();
      return true;
    } catch (error) {
      console.error("Error al conciliar:", error);
      toast.error("Error al conciliar el gasto");
      return false;
    }
  };

  return {
    handleReconcile,
  };
};
