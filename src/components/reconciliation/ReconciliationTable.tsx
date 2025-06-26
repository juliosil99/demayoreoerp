
import { useState } from "react";
import { useReconciliation } from "./hooks/useReconciliation";
import { useOptimizedExpenses } from "./hooks/useOptimizedExpenses";
import { useOptimizedInvoices } from "./hooks/useOptimizedInvoices";
import { ExpenseCard } from "./components/ExpenseCard";
import { InvoiceSearchDialog } from "./components/invoice-search";
import { AccountAdjustmentDialog } from "./components/AccountAdjustmentDialog";
import { ManualReconciliationDialog } from "./components/ManualReconciliationDialog";
import { ReconciliationSkeleton } from "./components/ReconciliationSkeleton";
import { ReconciliationPagination } from "./components/ReconciliationPagination";

interface ReconciliationTableProps {
  expenses?: any[]; // Keep for backward compatibility but won't be used
  invoices?: any[]; // Keep for backward compatibility but won't be used
}

export function ReconciliationTable({ expenses: _expenses, invoices: _invoices }: ReconciliationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Use optimized hooks instead of props
  const { 
    data: expensesResult, 
    isLoading: expensesLoading,
    refetch: refetchExpenses 
  } = useOptimizedExpenses({ 
    page: currentPage, 
    pageSize 
  });
  
  const { 
    data: invoices, 
    isLoading: invoicesLoading 
  } = useOptimizedInvoices();

  const expenses = expensesResult?.data || [];
  const totalExpenses = expensesResult?.count || 0;

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
  const filteredInvoices = filterInvoices(invoices || [], searchTerm);

  const handleExpenseSelect = (expense: any) => {
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resetState(); // Clear any selected items when changing pages
  };

  // Refresh data after successful reconciliation
  const handleReconciliationSuccess = () => {
    refetchExpenses();
    resetState();
  };

  // Show loading skeleton
  if (expensesLoading && currentPage === 1) {
    return <ReconciliationSkeleton />;
  }

  return (
    <div className="space-y-4 max-w-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold px-2 sm:px-0">Gastos sin Conciliar</h3>
          {expensesLoading && (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          )}
        </div>
        
        {expenses.length === 0 && !expensesLoading ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay gastos pendientes de conciliar</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onSelectExpense={handleExpenseSelect}
                />
              ))}
            </div>
            
            <ReconciliationPagination
              currentPage={currentPage}
              totalItems={totalExpenses}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              isLoading={expensesLoading}
            />
          </>
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
        isLoadingInvoices={invoicesLoading}
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
