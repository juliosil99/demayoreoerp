
import { useCallback } from "react";
import { toast } from "sonner"; // Usaremos toaster para mensajes

/**
 * Calcula el monto total y el restante solo si todas las facturas y el gasto están en la misma moneda.
 * Si encuentra una factura en moneda distinta, retorna error=true.
 */
function calculateSelectionOriginal(expense: any, invoices: any[]) {
  if (!expense || !invoices.length) {
    return { totalSelectedAmount: 0, remainingAmount: 0, error: false };
  }
  const expenseCurrency = expense.currency || "MXN";
  const expenseAmount = expenseCurrency === 'USD' ? expense.original_amount : expense.amount;

  // Asegura todas las facturas coinciden en moneda
  for (const invoice of invoices) {
    const invoiceCurrency = invoice.currency || "MXN";
    if (invoiceCurrency !== expenseCurrency) {
      return { totalSelectedAmount: 0, remainingAmount: 0, error: true, errorCurrency: invoiceCurrency };
    }
  }
  // Calcula el total según tipo de factura (resta si es nota de crédito)
  const totalSelectedAmount = invoices.reduce((sum, inv) => {
    const amount = inv.invoice_type === "E" ? -inv.total_amount : inv.total_amount;
    return sum + amount;
  }, 0);

  const remainingAmount = expenseAmount - totalSelectedAmount;
  return { totalSelectedAmount, remainingAmount, error: false };
}

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

    const { totalSelectedAmount, remainingAmount, error, errorCurrency } = calculateSelectionOriginal(expense, invoices);

    if (error) {
      toast.error(`Todas las facturas deben estar en la misma moneda que el gasto (${expense.currency || "MXN"}). Se encontró una factura en ${errorCurrency}.`);
      return;
    }

    setSelectedInvoices(invoices);
    setRemainingAmount(remainingAmount);

    if (Math.abs(remainingAmount) > 0.01) { // threshold para decimales flotantes
      const adjustmentType = remainingAmount > 0 ? "expense_excess" : "invoice_excess";
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
    } else {
      // Montos idénticos en moneda original: conciliar automáticamente
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
