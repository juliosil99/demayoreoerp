
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
      
      // Get expense amount in its original currency
      const expenseCurrency = expense.currency || 'MXN';
      const expenseAmount = expenseCurrency === 'USD' ? expense.original_amount : expense.amount;
      
      // Verify all invoices are in the same currency as expense
      for (const invoice of invoicesToReconcile) {
        const invoiceCurrency = invoice.currency || 'MXN';
        if (invoiceCurrency !== expenseCurrency) {
          toast.error(`No se puede conciliar: el gasto está en ${expenseCurrency} pero la factura ${invoice.invoice_number} está en ${invoiceCurrency}`);
          return false;
        }
      }
      
      let remainingExpenseAmount = expenseAmount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        const invoiceCurrency = invoice.currency || 'MXN';
        
        // Work with original amounts directly
        const invoiceAmount = invoice.total_amount;
        
        const comparableInvoiceAmount = invoice.invoice_type === 'E' 
          ? -invoiceAmount
          : invoiceAmount;
          
        const reconciliationAmount = invoice.invoice_type === 'E' 
          ? -Math.min(remainingExpenseAmount, Math.abs(comparableInvoiceAmount))
          : Math.min(remainingExpenseAmount, comparableInvoiceAmount);
        
        const absReconciledAmount = Math.abs(reconciliationAmount);

        const { error: relationError } = await supabase
          .from("expense_invoice_relations")
          .insert([{
            expense_id: expense.id,
            invoice_id: invoice.id,
            reconciled_amount: absReconciledAmount, // Store in original currency
            paid_amount: absReconciledAmount, // Store in original currency
            amount: absReconciledAmount, // Store in original currency
            original_amount: invoice.total_amount,
            currency: invoiceCurrency,
            exchange_rate: expense.exchange_rate || 1
          }]);

        if (relationError) throw relationError;

        // Update invoice's paid amount in its original currency
        const newPaidAmount = (invoice.paid_amount || 0) + absReconciledAmount;
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: newPaidAmount,
            processed: Math.abs(newPaidAmount) >= Math.abs(invoice.total_amount)
          })
          .eq("id", invoice.id);

        if (invoiceError) throw invoiceError;

        // Adjust the remaining expense amount in original currency
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
