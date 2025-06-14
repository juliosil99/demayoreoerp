
import { useCallback } from "react";
import { toast } from "sonner";
import { calculateExpenseSelection } from "./calculation/calculateExpenseSelection";

export const useInvoiceSelection = (
  expense: any | null,
  selectedInvoices: any[],
  setSelectedInvoices: (invoices: any[]) => void,
  setRemainingAmount: (amount: number) => void,
  setAdjustmentType: (type: "expense_excess" | "invoice_excess") => void,
  setShowAdjustmentDialog: (show: boolean) => void,
  handleReconcile: (expense: any, invoices: any[]) => Promise<boolean>
) => {
  const handleInvoiceSelect = useCallback((invoices: any[]) => {
    if (!expense) return;

    const { totalSelectedAmount, remainingAmount, error, errorCurrency } = calculateExpenseSelection(expense, invoices);

    if (error) {
      toast.error(`Todas las facturas deben estar en la misma moneda que el gasto (${expense.currency || "MXN"}). Se encontró una factura en ${errorCurrency}.`);
      return;
    }

    setSelectedInvoices(invoices);
    setRemainingAmount(remainingAmount);

    if (Math.abs(remainingAmount) > 0.01) {
      const adjustmentType = remainingAmount > 0 ? "expense_excess" : "invoice_excess";
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
    } else {
      handleReconcile(expense, invoices);
    }
  }, [
    expense, 
    setSelectedInvoices, 
    setRemainingAmount, 
    setAdjustmentType, 
    setShowAdjustmentDialog, 
    handleReconcile
  ]);

  return {
    handleInvoiceSelect
  };
};
