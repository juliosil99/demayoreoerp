
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReconciliationSearch } from "./components/ReconciliationSearch";
import { ReconciliationExpenseGrid } from "./components/ReconciliationExpenseGrid";
import { ReconciliationDialogs } from "./components/ReconciliationDialogs";
import { useOptimizedExpenses } from "./hooks/useOptimizedExpenses";
import { useOptimizedInvoices } from "./hooks/useOptimizedInvoices";
import { useReconciliation } from "./hooks/useReconciliation";

export function ReconciliationTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const { data: expensesData, isLoading: expensesLoading } = useOptimizedExpenses({
    page,
    pageSize: itemsPerPage,
    enabled: true
  });

  const { data: invoices, isLoading: invoicesLoading } = useOptimizedInvoices();

  // Use the centralized reconciliation hook
  const {
    selectedExpense,
    selectedInvoices,
    remainingAmount,
    showAdjustmentDialog,
    setShowAdjustmentDialog,
    adjustmentType,
    handleAdjustmentConfirm,
    showManualReconciliation,
    setShowManualReconciliation,
    handleManualReconciliation,
    handleManualReconciliationConfirm,
    chartAccounts,
    showInvoiceSearch,
    setShowInvoiceSearch,
    searchTerm: invoiceSearchTerm,
    setSearchTerm: setInvoiceSearchTerm,
    filterInvoices,
    handleInvoiceSelect,
    setSelectedExpense,
  } = useReconciliation();

  const expenses = expensesData?.data || [];
  const totalCount = expensesData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleExpenseClick = (expense: any) => {
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  const handleManualReconciliationComplete = async (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => {
    await handleManualReconciliationConfirm(data);
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    if (!searchTerm.trim()) return expenses;
    
    const term = searchTerm.toLowerCase();
    return expenses.filter((expense: any) =>
      expense.description?.toLowerCase().includes(term) ||
      expense.contacts?.name?.toLowerCase().includes(term) ||
      expense.amount?.toString().includes(term)
    );
  }, [expenses, searchTerm]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return filterInvoices(invoices, invoiceSearchTerm);
  }, [invoices, invoiceSearchTerm, filterInvoices]);

  if (expensesLoading || invoicesLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Format chart accounts for the dialogs (ensure account_type is included)
  const formattedChartAccounts = chartAccounts?.map(account => ({
    id: account.id,
    name: account.name,
    code: account.code,
    account_type: account.account_type || 'other'
  })) || [];

  return (
    <div className="space-y-6">
      {/* Search */}
      <ReconciliationSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Expenses Grid */}
      <div className="space-y-4">
        <ReconciliationExpenseGrid
          expenses={filteredExpenses}
          onExpenseClick={handleExpenseClick}
        />
      </div>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({totalCount} gastos total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* All Dialogs */}
      <ReconciliationDialogs
        showInvoiceSearch={showInvoiceSearch}
        setShowInvoiceSearch={setShowInvoiceSearch}
        selectedExpense={selectedExpense}
        remainingAmount={remainingAmount}
        selectedInvoices={selectedInvoices}
        invoiceSearchTerm={invoiceSearchTerm}
        onInvoiceSearchChange={setInvoiceSearchTerm}
        filteredInvoices={filteredInvoices}
        onInvoiceSelect={handleInvoiceSelect}
        onManualReconciliation={handleManualReconciliation}
        isLoadingInvoices={invoicesLoading}
        showManualReconciliation={showManualReconciliation}
        setShowManualReconciliation={setShowManualReconciliation}
        chartAccounts={formattedChartAccounts}
        onManualReconciliationConfirm={handleManualReconciliationComplete}
        showAdjustmentDialog={showAdjustmentDialog}
        setShowAdjustmentDialog={setShowAdjustmentDialog}
        adjustmentType={adjustmentType}
        onAdjustmentConfirm={handleAdjustmentConfirm}
      />
    </div>
  );
}
