
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
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"expense_excess" | "invoice_excess">("expense_excess");

  const handleInvoiceSelect = (invoice: any) => {
    const updatedInvoices = [...selectedInvoices, invoice];
    setSelectedInvoices(updatedInvoices);
    
    // Calculate remaining amount
    const totalSelectedAmount = updatedInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const newRemainingAmount = selectedExpense?.amount - totalSelectedAmount;
    setRemainingAmount(newRemainingAmount);

    if (newRemainingAmount !== 0) {
      setAdjustmentType(newRemainingAmount > 0 ? "expense_excess" : "invoice_excess");
      setShowAdjustmentDialog(true);
    } else {
      handleReconcile(updatedInvoices);
    }
  };

  const handleAdjustmentConfirm = async (chartAccountId: string, notes: string) => {
    try {
      const { error: adjustmentError } = await supabase
        .from("accounting_adjustments")
        .insert([{
          user_id: user!.id,
          expense_id: selectedExpense.id,
          invoice_id: selectedInvoices[selectedInvoices.length - 1].id,
          amount: Math.abs(remainingAmount),
          type: adjustmentType,
          chart_account_id: chartAccountId,
          notes
        }]);

      if (adjustmentError) throw adjustmentError;

      handleReconcile(selectedInvoices);
    } catch (error) {
      console.error("Error al crear el ajuste:", error);
      toast.error("Error al crear el ajuste contable");
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
            reconciled_amount: reconciliationAmount,
            paid_amount: reconciliationAmount
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
    setShowAdjustmentDialog(false);
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
    resetState,
    showAdjustmentDialog,
    setShowAdjustmentDialog,
    adjustmentType,
    handleAdjustmentConfirm
  };
};
