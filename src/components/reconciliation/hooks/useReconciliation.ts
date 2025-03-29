
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectedItems } from "./useSelectedItems";
import { useAdjustment } from "./useAdjustment";
import { useManualReconciliation } from "./useManualReconciliation";
import { useInvoiceSearch } from "./useInvoiceSearch";
import { useReconciliationProcess } from "./useReconciliationProcess";
import { useInvoiceSelection } from "./useInvoiceSelection";

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
    console.log("[useReconciliation] handleReconcile called with", invoicesToReconcile.length, "invoices");
    return rawHandleReconcile(selectedExpense, invoicesToReconcile);
  }, [rawHandleReconcile, selectedExpense]);

  const handleAdjustmentConfirm = useCallback((chartAccountId: string, notes: string) => {
    if (!selectedExpense || !selectedInvoices.length) {
      console.log("[useReconciliation] handleAdjustmentConfirm - missing expense or invoices, aborting");
      return;
    }
    
    console.log("[useReconciliation] handleAdjustmentConfirm called with chartAccountId:", chartAccountId);
    console.log("[useReconciliation] Adjustment type:", adjustmentType);
    console.log("[useReconciliation] Remaining amount:", remainingAmount);
    
    const result = rawHandleAdjustmentConfirm(
      selectedExpense.id,
      selectedInvoices[selectedInvoices.length - 1].id,
      chartAccountId,
      Math.abs(remainingAmount),
      adjustmentType,
      notes
    );
    
    if (result) {
      console.log("[useReconciliation] Adjustment successful, proceeding with reconciliation");
      handleReconcile(selectedInvoices);
    } else {
      console.log("[useReconciliation] Adjustment failed, not proceeding with reconciliation");
    }
    
    setShowAdjustmentDialog(false);
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
    console.log("[useReconciliation] handleManualReconciliation called");
    console.log("[useReconciliation] Closing invoice search dialog");
    setShowInvoiceSearch(false);
    
    console.log("[useReconciliation] Opening manual reconciliation dialog");
    setShowManualReconciliation(true);
    
    if (selectedExpense) {
      console.log(`[useReconciliation] Setting remaining amount to expense amount: ${selectedExpense.amount}`);
      setRemainingAmount(selectedExpense.amount);
    } else {
      console.log("[useReconciliation] No expense selected for manual reconciliation");
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
      console.log("[useReconciliation] handleManualReconciliationConfirm - no expense selected, aborting");
      return;
    }
    
    console.log("[useReconciliation] handleManualReconciliationConfirm called with data:", JSON.stringify(data, null, 2));
    console.log("[useReconciliation] Expense ID:", selectedExpense.id);
    
    const result = rawHandleManualReconciliationConfirm(selectedExpense.id, data);
    
    console.log("[useReconciliation] Manual reconciliation result:", result);
    
    if (result) {
      console.log("[useReconciliation] Manual reconciliation successful, resetting state");
      resetState();
    } else {
      console.log("[useReconciliation] Manual reconciliation failed");
    }
    
    console.log("[useReconciliation] Closing manual reconciliation dialog");
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
