
import { useReconciliation } from "./hooks/useReconciliation";
import { ExpenseCard } from "./components/ExpenseCard";
import { InvoiceSearchDialog } from "./components/invoice-search";
import { AccountAdjustmentDialog } from "./components/AccountAdjustmentDialog";
import { ManualReconciliationDialog } from "./components/ManualReconciliationDialog";
import { useEffect } from "react";

interface ReconciliationTableProps {
  expenses: any[];
  invoices: any[];
}

export function ReconciliationTable({ expenses, invoices }: ReconciliationTableProps) {
  const {
    // Selected items state
    selectedExpense,
    setSelectedExpense,
    selectedInvoices,
    remainingAmount,
    
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
    resetState,
  } = useReconciliation();

  // Use the filterInvoices function from our hook
  const filteredInvoices = filterInvoices(invoices, searchTerm);

  const handleExpenseSelect = (expense: any) => {
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  // Add an effect to reset the state when expenses change
  // This ensures the UI updates after reconciliation
  useEffect(() => {
    if (expenses.length === 0 && selectedExpense) {
      resetState();
    }
  }, [expenses, selectedExpense, resetState]);

  return (
    <div className="space-y-4 max-w-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-2 sm:px-0">Gastos sin Conciliar</h3>
        {expenses.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay gastos pendientes de conciliar</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onSelectExpense={handleExpenseSelect}
              />
            ))}
          </div>
        )}
      </div>

      <InvoiceSearchDialog
        open={showInvoiceSearch}
        onOpenChange={setShowInvoiceSearch}
        selectedExpense={selectedExpense}
        remainingAmount={remainingAmount}
        selectedInvoices={selectedInvoices}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredInvoices={filteredInvoices}
        onInvoiceSelect={handleInvoiceSelect}
        onManualReconciliation={handleManualReconciliation}
      />

      <AccountAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        amount={Math.abs(remainingAmount)}
        type={adjustmentType}
        onConfirm={handleAdjustmentConfirm}
      />

      <ManualReconciliationDialog
        open={showManualReconciliation}
        onOpenChange={setShowManualReconciliation}
        expense={selectedExpense}
        onConfirm={handleManualReconciliationConfirm}
        chartAccounts={chartAccounts || []}
      />
    </div>
  );
}
