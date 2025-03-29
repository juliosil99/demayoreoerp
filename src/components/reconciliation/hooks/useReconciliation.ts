
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

export const useReconciliation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"expense_excess" | "invoice_excess">("expense_excess");
  const [showManualReconciliation, setShowManualReconciliation] = useState(false);

  // Fetch chart of accounts for manual reconciliation
  const { data: chartAccounts } = useQuery({
    queryKey: ["chart-accounts-basic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('id, name, code')
        .eq('user_id', user!.id)
        .order('code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleInvoiceSelect = (invoice: any) => {
    const updatedInvoices = [...selectedInvoices, invoice];
    setSelectedInvoices(updatedInvoices);
    
    // Calculate remaining amount, accounting for credit notes (type E)
    const totalSelectedAmount = updatedInvoices.reduce((sum, inv) => {
      // For credit notes (type E), subtract the amount instead of adding it
      const amountToAdd = inv.invoice_type === 'E' ? -inv.total_amount : inv.total_amount;
      return sum + (amountToAdd || 0);
    }, 0);
    
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

  const handleManualReconciliation = () => {
    setShowInvoiceSearch(false);
    setShowManualReconciliation(true);
    setRemainingAmount(selectedExpense?.amount || 0);
  };

  const handleManualReconciliationConfirm = async (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => {
    try {
      // Create a manual reconciliation record
      const { error: manualError } = await supabase
        .from("manual_reconciliations")
        .insert([{
          expense_id: selectedExpense.id,
          user_id: user!.id,
          reconciliation_type: data.reconciliationType,
          reference_number: data.referenceNumber || null,
          notes: data.notes,
          file_id: data.fileId || null,
          chart_account_id: data.chartAccountId || selectedExpense.chart_account_id
        }]);

      if (manualError) throw manualError;
      
      // Update the expense to mark it as reconciled
      const { error: updateError } = await supabase
        .from("expenses")
        .update({ 
          reconciled: true,
          reconciliation_date: new Date().toISOString(),
          reconciliation_type: 'manual'
        })
        .eq("id", selectedExpense.id);

      if (updateError) throw updateError;

      toast.success("Gasto conciliado manualmente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      resetState();
    } catch (error) {
      console.error("Error al reconciliar manualmente:", error);
      toast.error("Error al reconciliar el gasto");
    } finally {
      setShowManualReconciliation(false);
    }
  };

  const handleReconcile = async (invoicesToReconcile: any[]) => {
    try {
      let remainingExpenseAmount = selectedExpense.amount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        // For credit notes (type E), subtract the amount instead of adding it
        const reconciliationAmount = invoice.invoice_type === 'E' 
          ? -Math.min(remainingExpenseAmount, -invoice.total_amount) // Negative for credit notes
          : Math.min(remainingExpenseAmount, invoice.total_amount);
          
        const { error: relationError } = await supabase
          .from("expense_invoice_relations")
          .insert([{
            expense_id: selectedExpense.id,
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
        .eq("id", selectedExpense.id);

      if (updateError) throw updateError;

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
    setShowManualReconciliation(false);
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
    handleAdjustmentConfirm,
    handleManualReconciliation,
    showManualReconciliation,
    setShowManualReconciliation,
    handleManualReconciliationConfirm,
    chartAccounts
  };
};
