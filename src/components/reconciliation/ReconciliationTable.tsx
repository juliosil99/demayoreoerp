
import { useReconciliation } from "./hooks/useReconciliation";
import { ExpenseCard } from "./components/ExpenseCard";
import { InvoiceSearchDialog } from "./components/InvoiceSearchDialog";
import { AccountAdjustmentDialog } from "./components/AccountAdjustmentDialog";
import { ManualReconciliationDialog } from "./components/ManualReconciliationDialog";
import { toast } from "sonner";
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
    console.log("Expense selected:", expense.id);
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  // Monitor when manual reconciliation is confirmed
  const onManualReconciliationConfirm = (data: any) => {
    console.log("Manual reconciliation confirmed with data:", JSON.stringify(data, null, 2));
    
    if (!selectedExpense) {
      console.error("No expense selected for manual reconciliation");
      toast.error("Error: No hay gasto seleccionado");
      return;
    }
    
    toast.info("Procesando reconciliación...");
    console.log("Calling handleManualReconciliationConfirm with expense ID:", selectedExpense.id);
    
    try {
      // First disable dialog closing
      setShowManualReconciliation(true);
      
      // Then handle reconciliation
      const result = handleManualReconciliationConfirm(data);
      console.log("Manual reconciliation result:", result);
      
      // Close the dialog and reset state after a delay to ensure the operation completes
      setTimeout(() => {
        console.log("Closing manual reconciliation dialog...");
        setShowManualReconciliation(false);
      }, 800);
    } catch (error) {
      console.error("Error during manual reconciliation:", error);
      toast.error("Error durante la reconciliación manual");
      
      // Make sure dialog closes even if there's an error
      setTimeout(() => {
        setShowManualReconciliation(false);
      }, 500);
    }
  };
  
  // Add an effect to reset the state when expenses change
  // This ensures the UI updates after reconciliation
  useEffect(() => {
    if (expenses.length === 0 && selectedExpense) {
      console.log("No expenses left, resetting state");
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
        onOpenChange={(open) => {
          console.log("Setting manual reconciliation dialog open state to:", open);
          setShowManualReconciliation(open);
        }}
        expense={selectedExpense}
        onConfirm={onManualReconciliationConfirm}
        chartAccounts={chartAccounts || []}
      />
    </div>
  );
}
