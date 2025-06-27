
import React from "react";
import { InvoiceSearchDialog } from "./invoice-search/InvoiceSearchDialog";
import { ManualReconciliationDialog } from "./ManualReconciliationDialog";
import { FixedAccountAdjustmentDialog } from "./FixedAccountAdjustmentDialog";

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
  onInvoiceSelect: (invoices: any[]) => void;
  onManualReconciliation: () => void;
  isLoadingInvoices: boolean;

  // Manual Reconciliation Dialog props
  showManualReconciliation: boolean;
  setShowManualReconciliation: (show: boolean) => void;
  chartAccounts: { id: string; name: string; code: string }[];
  onManualReconciliationConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;

  // Fixed Adjustment Dialog props
  showAdjustmentDialog: boolean;
  setShowAdjustmentDialog: (show: boolean) => void;
  adjustmentType: "expense_excess" | "invoice_excess";
  onAdjustmentConfirm: (chartAccountId: string, notes: string) => void;
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
  onInvoiceSelect,
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
        onInvoiceSelect={onInvoiceSelect}
        onManualReconciliation={onManualReconciliation}
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

      {/* Fixed Adjustment Dialog */}
      <FixedAccountAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        amount={remainingAmount}
        type={adjustmentType}
        onConfirm={onAdjustmentConfirm}
      />
    </>
  );
}
