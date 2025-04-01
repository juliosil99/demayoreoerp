
import { useCallback } from "react";
import { useInvoiceAmountCalculator } from "./calculation/useInvoiceAmountCalculator";

export const useInvoiceSelection = (
  expense: any | null,
  selectedInvoices: any[],
  setSelectedInvoices: (invoices: any[]) => void,
  setRemainingAmount: (amount: number) => void,
  setAdjustmentType: (type: "expense_excess" | "invoice_excess") => void,
  setShowAdjustmentDialog: (show: boolean) => void,
  handleReconcile: (expense: any, invoices: any[]) => Promise<boolean>
) => {
  const { calculateRemainingAmount, determineAdjustmentType } = useInvoiceAmountCalculator();

  const handleInvoiceSelect = useCallback((invoices: any[]) => {
    if (!expense) return;
    
    const updatedInvoices = invoices;
    setSelectedInvoices(updatedInvoices);
    
    const newRemainingAmount = calculateRemainingAmount(expense.amount, updatedInvoices);
    setRemainingAmount(newRemainingAmount);

    if (newRemainingAmount !== 0) {
      const adjustmentType = determineAdjustmentType(newRemainingAmount);
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
    } else {
      // If remaining amount is zero, proceed with reconciliation
      handleReconcile(expense, updatedInvoices);
    }
  }, [
    expense, 
    setSelectedInvoices, 
    setRemainingAmount, 
    setAdjustmentType, 
    setShowAdjustmentDialog, 
    handleReconcile,
    calculateRemainingAmount,
    determineAdjustmentType
  ]);

  return {
    handleInvoiceSelect
  };
};
