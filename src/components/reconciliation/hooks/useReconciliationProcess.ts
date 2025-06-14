
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrencyCalculator } from "./calculation/useCurrencyCalculator";

export const useReconciliationProcess = (
  userId: string | undefined,
  resetSelections: () => void,
) => {
  const queryClient = useQueryClient();
  const { convertCurrency } = useCurrencyCalculator();

  const handleReconcile = async (expense: any, invoicesToReconcile: any[]) => {
    try {
      if (!userId || !expense) return false;
      
      // The expense amount is always in MXN, which is our base for reconciliation logic.
      let remainingExpenseAmount = expense.amount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        const invoiceCurrency = invoice.currency || 'MXN';
        const exchangeRate = invoice.exchange_rate || expense.exchange_rate || 1;

        // Get invoice amount in MXN for correct comparison.
        const invoiceAmountInMXN = convertCurrency(
          invoice.total_amount,
          invoiceCurrency,
          'MXN',
          exchangeRate
        );

        const comparableInvoiceAmount = invoice.invoice_type === 'E' 
          ? -invoiceAmountInMXN
          : invoiceAmountInMXN;
          
        const reconciliationAmountInMXN = invoice.invoice_type === 'E' 
          ? -Math.min(remainingExpenseAmount, Math.abs(comparableInvoiceAmount))
          : Math.min(remainingExpenseAmount, comparableInvoiceAmount);
        
        const absReconciledMXN = Math.abs(reconciliationAmountInMXN);

        // Convert the reconciled MXN amount back to the invoice's original currency for storage
        const reconciledAmountInInvoiceCurrency = convertCurrency(
          absReconciledMXN,
          'MXN',
          invoiceCurrency,
          exchangeRate
        );

        const { error: relationError } = await supabase
          .from("expense_invoice_relations")
          .insert([{
            expense_id: expense.id,
            invoice_id: invoice.id,
            reconciled_amount: absReconciledMXN, // Store reconciled amount in MXN
            paid_amount: absReconciledMXN, // Store paid amount in MXN
            amount: reconciledAmountInInvoiceCurrency, // Store amount in original currency
            original_amount: invoice.total_amount,
            currency: invoiceCurrency,
            exchange_rate: exchangeRate
          }]);

        if (relationError) throw relationError;

        // Update invoice's paid amount in its original currency
        const newPaidAmount = (invoice.paid_amount || 0) + reconciledAmountInInvoiceCurrency;
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: newPaidAmount,
            processed: Math.abs(newPaidAmount) >= Math.abs(invoice.total_amount)
          })
          .eq("id", invoice.id);

        if (invoiceError) throw invoiceError;

        // Adjust the remaining expense amount (credit notes increase the remaining amount)
        remainingExpenseAmount -= reconciliationAmountInMXN;
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
