
import { useReconciliation } from "./hooks/useReconciliation";
import { ExpenseCard } from "./components/ExpenseCard";
import { InvoiceSearchDialog } from "./components/InvoiceSearchDialog";
import { AccountAdjustmentDialog } from "./components/AccountAdjustmentDialog";
import { ManualReconciliationDialog } from "./components/ManualReconciliationDialog";

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
  } = useReconciliation();

  // Use the filterInvoices function from our hook
  const filteredInvoices = filterInvoices(invoices, searchTerm);

  const handleExpenseSelect = (expense: any) => {
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-2 sm:px-0">Gastos sin Conciliar</h3>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onSelectExpense={handleExpenseSelect}
            />
          ))}
        </div>
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
