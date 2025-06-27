
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseCard } from "./components/ExpenseCard";
import { FixedAccountAdjustmentDialog } from "./components/FixedAccountAdjustmentDialog";
import { InvoiceSearchDialog } from "./components/invoice-search/InvoiceSearchDialog";
import { ManualReconciliationDialog } from "./components/ManualReconciliationDialog";
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
    setSelectedExpense,
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
    resetState,
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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Buscar gastos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Buscar por descripción, proveedor o monto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron gastos para reconciliar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onSelectExpense={handleExpenseClick}
              />
            ))}
          </div>
        )}
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

      {/* Invoice Search Dialog */}
      <InvoiceSearchDialog
        open={showInvoiceSearch}
        onOpenChange={setShowInvoiceSearch}
        selectedExpense={selectedExpense}
        remainingAmount={remainingAmount}
        selectedInvoices={selectedInvoices}
        searchTerm={invoiceSearchTerm}
        onSearchChange={setInvoiceSearchTerm}
        filteredInvoices={filteredInvoices}
        onInvoiceSelect={handleInvoiceSelect}
        onManualReconciliation={handleManualReconciliation}
        isLoadingInvoices={invoicesLoading}
      />

      {/* Manual Reconciliation Dialog */}
      <ManualReconciliationDialog
        open={showManualReconciliation}
        onOpenChange={setShowManualReconciliation}
        expense={selectedExpense}
        chartAccounts={chartAccounts || []}
        onConfirm={handleManualReconciliationComplete}
      />

      {/* Fixed Adjustment Dialog */}
      <FixedAccountAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        amount={remainingAmount}
        type={adjustmentType}
        onConfirm={handleAdjustmentConfirm}
      />
    </div>
  );
}
