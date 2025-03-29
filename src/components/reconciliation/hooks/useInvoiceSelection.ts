
import { useCallback } from "react";

export const useInvoiceSelection = (
  expense: any | null,
  selectedInvoices: any[],
  setSelectedInvoices: (invoices: any[]) => void,
  setRemainingAmount: (amount: number) => void,
  setAdjustmentType: (type: "expense_excess" | "invoice_excess") => void,
  setShowAdjustmentDialog: (show: boolean) => void,
  handleReconcile: (expense: any, invoices: any[]) => Promise<boolean>
) => {
  const handleInvoiceSelect = useCallback((invoice: any) => {
    if (!expense) return;
    
    const updatedInvoices = [...selectedInvoices, invoice];
    setSelectedInvoices(updatedInvoices);
    
    // Calculate remaining amount, accounting for credit notes (type E)
    const totalSelectedAmount = updatedInvoices.reduce((sum, inv) => {
      // For credit notes (type E), subtract the amount instead of adding it
      const amountToAdd = inv.invoice_type === 'E' ? -inv.total_amount : inv.total_amount;
      return sum + (amountToAdd || 0);
    }, 0);
    
    const newRemainingAmount = expense.amount - totalSelectedAmount;
    setRemainingAmount(newRemainingAmount);

    if (newRemainingAmount !== 0) {
      setAdjustmentType(newRemainingAmount > 0 ? "expense_excess" : "invoice_excess");
      setShowAdjustmentDialog(true);
    } else {
      // If remaining amount is zero, proceed with reconciliation
      handleReconcile(expense, updatedInvoices);
    }
  }, [expense, selectedInvoices, setSelectedInvoices, setRemainingAmount, setAdjustmentType, setShowAdjustmentDialog, handleReconcile]);

  return {
    handleInvoiceSelect
  };
};
