
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectedItems } from "./useSelectedItems";
import { useAdjustment } from "./useAdjustment";
import { useManualReconciliation } from "./useManualReconciliation";
import { useInvoiceSearch } from "./useInvoiceSearch";
import { useReconciliationProcess } from "./useReconciliationProcess";
import { useInvoiceSelection } from "./useInvoiceSelection";
import { toast } from "sonner";

export const useReconciliation = () => {
  const { user } = useAuth();
  
  // Extract functionality into smaller hooks
  const {
    selectedExpense,
    setSelectedExpense,
    selectedInvoices,
    setSelectedInvoices,
    remainingAmount,
    setRemainingAmount,
    resetState,
  } = useSelectedItems();

  const {
    showAdjustmentDialog,
    setShowAdjustmentDialog,
    adjustmentType,
    setAdjustmentType,
    handleAdjustmentConfirm: rawHandleAdjustmentConfirm,
  } = useAdjustment(user?.id);

  const {
    showManualReconciliation,
    setShowManualReconciliation,
    chartAccounts,
    handleManualReconciliationConfirm: rawHandleManualReconciliationConfirm,
  } = useManualReconciliation(user?.id);

  const {
    showInvoiceSearch,
    setShowInvoiceSearch,
    searchTerm,
    setSearchTerm,
    filterInvoices,
  } = useInvoiceSearch();

  const { handleReconcile: rawHandleReconcile } = useReconciliationProcess(
    user?.id,
    resetState
  );

  // Wrap the raw handlers to provide context-specific parameters
  const handleReconcile = useCallback((invoicesToReconcile: any[]) => {
    return rawHandleReconcile(selectedExpense, invoicesToReconcile);
  }, [rawHandleReconcile, selectedExpense]);

  const handleAdjustmentConfirm = useCallback(async (accountId: string, notes: string) => {
    if (!selectedExpense || !selectedInvoices.length) {
      toast.error("No hay gasto o facturas seleccionadas");
      return;
    }
    
    try {
      console.log("Starting adjustment confirmation process...");
      
      // Wait for the adjustment to be created using the user-selected account
      const adjustmentSuccess = await rawHandleAdjustmentConfirm(
        selectedExpense.id,
        selectedInvoices[selectedInvoices.length - 1].id,
        accountId, // Use the account ID selected by the user
        Math.abs(remainingAmount),
        adjustmentType,
        notes
      );
      
      if (adjustmentSuccess) {
        console.log("Adjustment created successfully, proceeding with reconciliation...");
        
        // Directly call reconciliation after successful adjustment
        await handleReconcile(selectedInvoices);
        
        console.log("Reconciliation completed successfully");
        toast.success("Ajuste y reconciliación completados exitosamente");
      } else {
        console.error("Failed to create adjustment");
        toast.error("Error al crear el ajuste contable");
      }
    } catch (error) {
      console.error("Error in adjustment confirmation process:", error);
      toast.error("Error en el proceso de ajuste y reconciliación");
    } finally {
      // Always close the dialog regardless of success or failure
      setShowAdjustmentDialog(false);
    }
  }, [
    selectedExpense, 
    selectedInvoices, 
    remainingAmount, 
    adjustmentType, 
    rawHandleAdjustmentConfirm, 
    handleReconcile, 
    setShowAdjustmentDialog
  ]);

  const handleManualReconciliation = useCallback(() => {
    setShowInvoiceSearch(false);
    setShowManualReconciliation(true);
    
    if (selectedExpense) {
      setRemainingAmount(selectedExpense.amount);
    }
  }, [setShowInvoiceSearch, setShowManualReconciliation, setRemainingAmount, selectedExpense]);

  const handleManualReconciliationConfirm = useCallback((data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => {
    if (!selectedExpense) {
      return;
    }
    
    const result = rawHandleManualReconciliationConfirm(selectedExpense.id, data);
    
    if (result) {
      resetState();
    }
    
    setShowManualReconciliation(false);
  }, [selectedExpense, rawHandleManualReconciliationConfirm, resetState, setShowManualReconciliation]);

  // Wire up the invoice selection logic
  const { handleInvoiceSelect } = useInvoiceSelection(
    selectedExpense,
    selectedInvoices,
    setSelectedInvoices,
    setRemainingAmount,
    setAdjustmentType,
    setShowAdjustmentDialog,
    rawHandleReconcile
  );

  return {
    // Selected items state
    selectedExpense,
    setSelectedExpense,
    selectedInvoices,
    setSelectedInvoices,
    remainingAmount,
    setRemainingAmount,
    
    // Adjustment dialog state and handlers
    showAdjustmentDialog,
    setShowAdjustmentDialog,
    adjustmentType,
    handleAdjustmentConfirm,
    
    // Manual reconciliation state and handlers
    showManualReconciliation,
    setShowManualReconciliation,
    handleManualReconciliation,
    handleManualReconciliationConfirm,
    chartAccounts,
    
    // Invoice search state and handlers
    showInvoiceSearch,
    setShowInvoiceSearch,
    searchTerm,
    setSearchTerm,
    filterInvoices,
    
    // Core reconciliation handlers
    handleInvoiceSelect,
    handleReconcile,
    resetState,
  };
};
