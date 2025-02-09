
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useReconciliation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);

  const handleInvoiceSelect = (invoice: any) => {
    const updatedInvoices = [...selectedInvoices, invoice];
    setSelectedInvoices(updatedInvoices);
    
    // Calculate remaining amount
    const totalSelectedAmount = updatedInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const newRemainingAmount = selectedExpense?.amount - totalSelectedAmount;
    setRemainingAmount(newRemainingAmount);

    // If all amount is reconciled, proceed with reconciliation
    if (newRemainingAmount === 0) {
      handleReconcile(updatedInvoices);
    } else if (newRemainingAmount < 0) {
      // Remove the last added invoice as it would exceed the expense amount
      setSelectedInvoices(selectedInvoices);
      toast.error("El monto total de las facturas excede el monto del gasto");
    }
  };

  const handleReconcile = async (invoicesToReconcile: any[]) => {
    try {
      let remainingExpenseAmount = selectedExpense.amount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        const reconciliationAmount = Math.min(remainingExpenseAmount, invoice.total_amount);
        
        const { error: relationError } = await supabase
          .from("expense_invoice_relations")
          .insert([{
            expense_id: selectedExpense.id,
            invoice_id: invoice.id,
            reconciled_amount: reconciliationAmount
          }]);

        if (relationError) throw relationError;

        // Update invoice paid amount
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: invoice.paid_amount + reconciliationAmount,
            processed: reconciliationAmount === invoice.total_amount
          })
          .eq("id", invoice.id);

        if (invoiceError) throw invoiceError;

        remainingExpenseAmount -= reconciliationAmount;

        // If there's remaining invoice amount, create accounts receivable record
        if (invoice.total_amount > reconciliationAmount) {
          const { error: payableError } = await supabase
            .from("accounts_receivable")
            .insert([{
              user_id: user!.id,
              invoice_id: invoice.id,
              amount: invoice.total_amount - reconciliationAmount,
              description: `Monto pendiente por pagar de factura ${invoice.invoice_number || invoice.uuid}`
            }]);

          if (payableError) throw payableError;
        }
      }

      toast.success("Gasto conciliado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
      resetState();
    } catch (error) {
      console.error("Error al conciliar:", error);
      toast.error("Error al conciliar el gasto");
    }
  };

  const resetState = () => {
    setShowInvoiceSearch(false);
    setSelectedExpense(null);
    setSelectedInvoices([]);
    setRemainingAmount(0);
  };

  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return {
    selectedExpense,
    setSelectedExpense,
    selectedInvoices,
    setSelectedInvoices,
    remainingAmount,
    setRemainingAmount,
    showInvoiceSearch,
    setShowInvoiceSearch,
    searchTerm,
    setSearchTerm,
    handleInvoiceSelect,
    handleReconcile,
    resetState
  };
};
