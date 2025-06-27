
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
      
      console.log("🔄 useReconciliationProcess - Starting reconciliation:");
      console.log("💰 Expense:", expense);
      console.log("📋 Invoices to reconcile:", invoicesToReconcile);
      console.log("📊 Type of invoicesToReconcile:", typeof invoicesToReconcile);
      console.log("🔢 Is array?", Array.isArray(invoicesToReconcile));
      console.log("📏 Length:", invoicesToReconcile?.length);
      
      // Validate that invoicesToReconcile is an array
      if (!Array.isArray(invoicesToReconcile)) {
        console.error("❌ invoicesToReconcile is not an array:", invoicesToReconcile);
        toast.error("Error interno: datos de facturas inválidos");
        return false;
      }
      
      // Get expense amount in its original currency
      const expenseCurrency = expense.currency || 'MXN';
      const expenseAmount = expenseCurrency === 'USD' ? expense.original_amount : expense.amount;
      
      console.log("🏦 Expense currency:", expenseCurrency);
      console.log("💲 Expense amount:", expenseAmount);
      
      // Verify all invoices are in the same currency as expense
      for (const invoice of invoicesToReconcile) {
        const invoiceCurrency = invoice.currency || 'MXN';
        console.log("📄 Invoice currency:", invoiceCurrency, "for invoice:", invoice.invoice_number);
        if (invoiceCurrency !== expenseCurrency) {
          toast.error(`No se puede conciliar: el gasto está en ${expenseCurrency} pero la factura ${invoice.invoice_number} está en ${invoiceCurrency}`);
          return false;
        }
      }
      
      let remainingExpenseAmount = expenseAmount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        console.log("🔄 Processing invoice:", invoice.invoice_number || invoice.id);
        
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

        console.log("💲 Reconciliation amount:", reconciliationAmount);
        console.log("💲 Abs reconciled amount:", absReconciledAmount);

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

        if (relationError) {
          console.error("❌ Error creating relation:", relationError);
          throw relationError;
        }

        // Update invoice's paid amount in its original currency
        const newPaidAmount = (invoice.paid_amount || 0) + absReconciledAmount;
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: newPaidAmount,
            processed: Math.abs(newPaidAmount) >= Math.abs(invoice.total_amount)
          })
          .eq("id", invoice.id);

        if (invoiceError) {
          console.error("❌ Error updating invoice:", invoiceError);
          throw invoiceError;
        }

        // Adjust the remaining expense amount in original currency
        remainingExpenseAmount -= reconciliationAmount;
        console.log("💰 Remaining expense amount:", remainingExpenseAmount);
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

      if (updateError) {
        console.error("❌ Error updating expense:", updateError);
        throw updateError;
      }

      console.log("✅ Reconciliation completed successfully");
      toast.success("Gasto conciliado exitosamente");
      
      // Immediately reset selections to close dialogs
      resetSelections();
      
      // Invalidate with correct query keys - use the exact same keys as useOptimizedExpenses
      await queryClient.invalidateQueries({ queryKey: ["optimized-unreconciled-expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
      
      return true;
    } catch (error) {
      console.error("❌ Error al conciliar:", error);
      toast.error("Error al conciliar el gasto");
      return false;
    }
  };

  return {
    handleReconcile,
  };
};
