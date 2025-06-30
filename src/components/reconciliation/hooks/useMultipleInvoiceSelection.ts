
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useMultipleInvoiceSelection = (
  selectedExpense: any | null,
  setSelectedInvoices: (invoices: any[]) => void,
  setRemainingAmount: (amount: number) => void,
  setAdjustmentType: (type: "expense_excess" | "invoice_excess") => void,
  setShowAdjustmentDialog: (show: boolean) => void,
  handleReconcile: (expense: any, invoices: any[]) => Promise<boolean>
) => {
  const [currentSelectedInvoices, setCurrentSelectedInvoices] = useState<any[]>([]);

  const handleInvoiceToggle = useCallback((invoice: any) => {
    if (!selectedExpense) return;

    setCurrentSelectedInvoices(prev => {
      const isAlreadySelected = prev.some(selected => selected.id === invoice.id);
      let newSelection: any[];

      if (isAlreadySelected) {
        // Remove invoice
        newSelection = prev.filter(selected => selected.id !== invoice.id);
      } else {
        // Add invoice - but first check currency compatibility
        const expenseCurrency = selectedExpense.currency || 'MXN';
        const invoiceCurrency = invoice.currency || 'MXN';

        if (expenseCurrency !== invoiceCurrency) {
          toast.error(`La factura debe estar en la misma moneda que el gasto (${expenseCurrency}). Esta factura está en ${invoiceCurrency}.`);
          return prev;
        }

        // Check if adding this invoice would create currency conflicts with other selected invoices
        if (prev.length > 0) {
          const existingCurrency = prev[0].currency || 'MXN';
          if (existingCurrency !== invoiceCurrency) {
            toast.error(`Todas las facturas deben estar en la misma moneda. Ya tienes facturas seleccionadas en ${existingCurrency}.`);
            return prev;
          }
        }

        newSelection = [...prev, invoice];
      }

      // Update the parent component with the new selection
      setSelectedInvoices(newSelection);

      // Calculate remaining amount
      if (newSelection.length > 0) {
        const totalInvoiceAmount = newSelection.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
        const remaining = selectedExpense.amount - totalInvoiceAmount;
        setRemainingAmount(remaining);

        console.log("💲 Total selected invoice amount:", totalInvoiceAmount);
        console.log("💰 Expense amount:", selectedExpense.amount);
        console.log("💸 Remaining amount:", remaining);

        // Check if it's an exact match (difference <= 0.01)
        const isExactMatch = Math.abs(remaining) <= 0.01;

        if (isExactMatch) {
          console.log("✅ Perfect match detected, ready for direct reconciliation");
        } else {
          console.log("⚖️ Adjustment needed");
        }
      } else {
        setRemainingAmount(0);
      }

      return newSelection;
    });
  }, [selectedExpense, setSelectedInvoices, setRemainingAmount]);

  const handleReconcileSelected = useCallback(async () => {
    if (!selectedExpense || currentSelectedInvoices.length === 0) {
      toast.error("Selecciona al menos una factura para reconciliar");
      return;
    }

    const totalInvoiceAmount = currentSelectedInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const remaining = selectedExpense.amount - totalInvoiceAmount;
    const isExactMatch = Math.abs(remaining) <= 0.01;

    if (isExactMatch) {
      console.log("✅ Perfect match, proceeding with direct reconciliation");
      try {
        const success = await handleReconcile(selectedExpense, currentSelectedInvoices);
        if (success) {
          setCurrentSelectedInvoices([]);
          toast.success("Reconciliación completada exitosamente");
        }
      } catch (error) {
        console.error("❌ Error in reconciliation:", error);
        toast.error("Error al realizar la reconciliación");
      }
    } else {
      // Show adjustment dialog
      const adjustmentType = remaining > 0 ? "expense_excess" : "invoice_excess";
      console.log("⚖️ Adjustment needed, type:", adjustmentType);
      setAdjustmentType(adjustmentType);
      setShowAdjustmentDialog(true);
    }
  }, [selectedExpense, currentSelectedInvoices, handleReconcile, setAdjustmentType, setShowAdjustmentDialog]);

  const clearSelection = useCallback(() => {
    setCurrentSelectedInvoices([]);
    setSelectedInvoices([]);
    setRemainingAmount(0);
  }, [setSelectedInvoices, setRemainingAmount]);

  return {
    currentSelectedInvoices,
    handleInvoiceToggle,
    handleReconcileSelected,
    clearSelection,
    setCurrentSelectedInvoices
  };
};
