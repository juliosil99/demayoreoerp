
import { useCallback } from "react";
import { useCurrencyCalculator } from "./calculation/useCurrencyCalculator";

export const useInvoiceSelection = (
  expense: any | null,
  selectedInvoices: any[],
  setSelectedInvoices: (invoices: any[]) => void,
  setRemainingAmount: (amount: number) => void,
  setAdjustmentType: (type: "expense_excess" | "invoice_excess") => void,
  setShowAdjustmentDialog: (show: boolean) => void,
  handleReconcile: (expense: any, invoices: any[]) => Promise<boolean>
) => {
  const { calculateRemainingWithCurrency } = useCurrencyCalculator();

  const handleInvoiceSelect = useCallback((invoices: any[]) => {
    if (!expense) return;
    
    const updatedInvoices = invoices;
    setSelectedInvoices(updatedInvoices);
    
    const { remainingAmount } = calculateRemainingWithCurrency(expense, updatedInvoices);
    setRemainingAmount(remainingAmount);

    if (Math.abs(remainingAmount) > 0.01) { // Using small threshold for floating point comparison
      const adjustmentType = remainingAmount > 0 ? "expense_excess" : "invoice_excess";
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
    } else {
      // If remaining amount is essentially zero, proceed with reconciliation
      handleReconcile(expense, updatedInvoices);
    }
  }, [
    expense, 
    setSelectedInvoices, 
    setRemainingAmount, 
    setAdjustmentType, 
    setShowAdjustmentDialog, 
    handleReconcile,
    calculateRemainingWithCurrency
  ]);

  return {
    handleInvoiceSelect
  };
};
