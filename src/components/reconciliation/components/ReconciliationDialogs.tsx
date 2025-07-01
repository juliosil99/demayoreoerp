
import React from "react";
import { InvoiceSearchDialog } from "./invoice-search/InvoiceSearchDialog";
import { ManualReconciliationDialog } from "./ManualReconciliationDialog";
import { AccountSelectionDialog } from "./AccountSelectionDialog";

interface ReconciliationDialogsProps {
  // Invoice Search Dialog props
  showInvoiceSearch: boolean;
  setShowInvoiceSearch: (show: boolean) => void;
  selectedExpense: any;
  remainingAmount: number;
  selectedInvoices: any[];
  invoiceSearchTerm: string;
  onInvoiceSearchChange: (term: string) => void;
  filteredInvoices: any[];
  onInvoiceToggle: (invoice: any) => void;
  onManualReconciliation: () => void;
  isLoadingInvoices: boolean;

  // Manual Reconciliation Dialog props
  showManualReconciliation: boolean;
  setShowManualReconciliation: (show: boolean) => void;
  chartAccounts: { id: string; name: string; code: string; account_type: string }[];
  onManualReconciliationConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;

  // Account Selection Dialog props (replacing Fixed Adjustment Dialog)
  showAdjustmentDialog: boolean;
  setShowAdjustmentDialog: (show: boolean) => void;
  adjustmentType: "expense_excess" | "invoice_excess";
  onAdjustmentConfirm: (accountId: string, notes: string) => void;
  onReconcileSelected: () => void;
  onClearSelection: () => void;
}

export function ReconciliationDialogs({
  showInvoiceSearch,
  setShowInvoiceSearch,
  selectedExpense,
  remainingAmount,
  selectedInvoices,
  invoiceSearchTerm,
  onInvoiceSearchChange,
  filteredInvoices,
  onInvoiceToggle,
  onManualReconciliation,
  isLoadingInvoices,
  showManualReconciliation,
  setShowManualReconciliation,
  chartAccounts,
  onManualReconciliationConfirm,
  showAdjustmentDialog,
  setShowAdjustmentDialog,
  adjustmentType,
  onAdjustmentConfirm,
  onReconcileSelected,
  onClearSelection,
}: ReconciliationDialogsProps) {
  return (
    <>
      {/* Invoice Search Dialog */}
      <InvoiceSearchDialog
        open={showInvoiceSearch}
        onOpenChange={setShowInvoiceSearch}
        selectedExpense={selectedExpense}
        remainingAmount={remainingAmount}
        selectedInvoices={selectedInvoices}
        searchTerm={invoiceSearchTerm}
        onSearchChange={onInvoiceSearchChange}
        filteredInvoices={filteredInvoices}
        onInvoiceToggle={onInvoiceToggle}
        onManualReconciliation={onManualReconciliation}
        onReconcileSelected={onReconcileSelected}
        onClearSelection={onClearSelection}
        isLoadingInvoices={isLoadingInvoices}
      />

      {/* Manual Reconciliation Dialog */}
      <ManualReconciliationDialog
        open={showManualReconciliation}
        onOpenChange={setShowManualReconciliation}
        expense={selectedExpense}
        chartAccounts={chartAccounts || []}
        onConfirm={onManualReconciliationConfirm}
      />

      {/* Account Selection Dialog (replaces Fixed Adjustment Dialog) */}
      <AccountSelectionDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        amount={remainingAmount}
        type={adjustmentType}
        chartAccounts={chartAccounts || []}
        onConfirm={onAdjustmentConfirm}
      />
    </>
  );
}
