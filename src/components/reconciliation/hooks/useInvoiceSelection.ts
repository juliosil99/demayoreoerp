
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
  const handleInvoiceSelect = useCallback(async (invoices: any[]) => {
    if (!expense) return;

    console.log("🔍 useInvoiceSelection - handleInvoiceSelect received:");
    console.log("💰 Expense:", expense);
    console.log("📋 Invoices:", invoices);

    // Validate that invoices is an array
    if (!Array.isArray(invoices)) {
      console.error("❌ useInvoiceSelection - invoices is not an array:", invoices);
      toast.error("Error interno: formato de facturas inválido");
      return;
    }

    // If no invoices are selected, just return without opening adjustment dialog
    if (invoices.length === 0) {
      setSelectedInvoices([]);
      setRemainingAmount(0);
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

    // Check if it's an exact match (difference <= 0.01)
    const isExactMatch = Math.abs(remainingAmount) <= 0.01;

    if (isExactMatch) {
      console.log("✅ Perfect match detected, proceeding directly to reconciliation");
      // Proceed directly to reconciliation without showing adjustment dialog
      try {
        const success = await handleReconcile(expense, invoices);
        if (success) {
          console.log("✅ Direct reconciliation completed successfully");
        }
      } catch (error) {
        console.error("❌ Error in direct reconciliation:", error);
        toast.error("Error al realizar la reconciliación");
      }
    } else {
      // Show adjustment dialog for user to select account
      const adjustmentType = remainingAmount > 0 ? "expense_excess" : "invoice_excess";
      console.log("⚖️ Adjustment needed, type:", adjustmentType);
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
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
