
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

    console.log("🔍 useInvoiceSelection - handleInvoiceSelect received:");
    console.log("💰 Expense:", expense);
    console.log("📋 Invoices:", invoices);
    console.log("📊 Type of invoices:", typeof invoices);
    console.log("🔢 Is array?", Array.isArray(invoices));
    console.log("📏 Length:", invoices?.length);

    // Validate that invoices is an array
    if (!Array.isArray(invoices)) {
      console.error("❌ useInvoiceSelection - invoices is not an array:", invoices);
      toast.error("Error interno: formato de facturas inválido");
      return;
    }

    const { totalSelectedAmount, remainingAmount, error, errorCurrency } = calculateExpenseSelection(expense, invoices);

    if (error) {
      toast.error(`Todas las facturas deben estar en la misma moneda que el gasto (${expense.currency || "MXN"}). Se encontró una factura en ${errorCurrency}.`);
      return;
    }

    setSelectedInvoices(invoices);
    setRemainingAmount(remainingAmount);

    console.log("💲 Total selected amount:", totalSelectedAmount);
    console.log("💰 Remaining amount:", remainingAmount);

    if (Math.abs(remainingAmount) > 0.01) {
      const adjustmentType = remainingAmount > 0 ? "expense_excess" : "invoice_excess";
      console.log("⚖️ Adjustment needed, type:", adjustmentType);
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
    } else {
      console.log("✅ Perfect match, proceeding with reconciliation");
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
