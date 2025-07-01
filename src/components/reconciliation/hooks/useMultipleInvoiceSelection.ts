import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getReconciliationAmount } from "../utils/currencyUtils";

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

      // Calculate remaining amount with proper credit note handling and correct expense amount
      if (newSelection.length > 0) {
        const totalInvoiceAmount = newSelection.reduce((sum, inv) => {
          const isCredit = inv.invoice_type === 'E';
          const amount = isCredit ? -inv.total_amount : inv.total_amount;
          
          console.log(`🧾 Processing invoice ${inv.id}: type=${inv.invoice_type}, base_amount=${inv.total_amount}, final_amount=${amount}, is_credit=${isCredit}`);
          
          return sum + amount;
        }, 0);
        
        // Use the correct amount for reconciliation (original amount for USD expenses)
        const expenseAmount = getReconciliationAmount(selectedExpense);
        const remaining = expenseAmount - totalInvoiceAmount;
        setRemainingAmount(remaining);

        console.log("💲 Total selected invoice amount (after credit adjustments):", totalInvoiceAmount);
        console.log("💰 Expense amount (reconciliation):", expenseAmount);
        console.log("💰 Expense currency:", selectedExpense.currency || 'MXN');
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

    // Calculate total with proper credit note handling
    const totalInvoiceAmount = currentSelectedInvoices.reduce((sum, inv) => {
      const isCredit = inv.invoice_type === 'E';
      const amount = isCredit ? -inv.total_amount : inv.total_amount;
      return sum + amount;
    }, 0);
    
    // Use the correct amount for reconciliation
    const expenseAmount = getReconciliationAmount(selectedExpense);
    const remaining = expenseAmount - totalInvoiceAmount;
    const isExactMatch = Math.abs(remaining) <= 0.01;

    console.log("🔄 Reconciling selected invoices:");
    console.log("📊 Invoice breakdown:", currentSelectedInvoices.map(inv => ({
      id: inv.id,
      type: inv.invoice_type,
      base_amount: inv.total_amount,
      final_amount: inv.invoice_type === 'E' ? -inv.total_amount : inv.total_amount,
      is_credit: inv.invoice_type === 'E'
    })));
    console.log("💲 Total calculated amount:", totalInvoiceAmount);
    console.log("💰 Expense amount (reconciliation):", expenseAmount);
    console.log("💰 Expense currency:", selectedExpense.currency || 'MXN');
    console.log("💸 Remaining:", remaining);

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
