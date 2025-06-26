import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseCard } from "./components/ExpenseCard";
import { InvoiceSearchDialog } from "./components/invoice-search/InvoiceSearchDialog";
import { SimpleAccountAdjustmentDialog } from "./components/SimpleAccountAdjustmentDialog";
import { BatchReconciliationDialog } from "./components/BatchReconciliationDialog";
import { ReconciliationPagination } from "./components/ReconciliationPagination";
import { useOptimizedExpenses } from "./hooks/useOptimizedExpenses";
import { useOptimizedInvoices } from "./hooks/useOptimizedInvoices";
import { useReconciliationProcess } from "./hooks/useReconciliationProcess";
import { useSelectedItems } from "./hooks/useSelectedItems";
import { useInvoiceSelection } from "./hooks/useInvoiceSelection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReconciliationTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"expense_excess" | "invoice_excess">("expense_excess");
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const itemsPerPage = 10;

  const { data: expenses, isLoading: expensesLoading, totalCount } = useOptimizedExpenses({
    page,
    itemsPerPage,
    searchTerm,
    sortBy,
    sortOrder,
    filterBy
  });

  const { data: invoices, isLoading: invoicesLoading } = useOptimizedInvoices();

  const { selectedExpenses, selectedInvoices, setSelectedInvoices, toggleExpenseSelection } = useSelectedItems();

  const { handleReconcile } = useReconciliationProcess();

  const { handleInvoiceSelect } = useInvoiceSelection(
    selectedExpense,
    selectedInvoices,
    setSelectedInvoices,
    setRemainingAmount,
    setAdjustmentType,
    setShowAdjustmentDialog,
    handleReconcile
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleExpenseClick = (expense: any) => {
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  const handleAdjustmentConfirm = async (chartAccountId: string, notes: string) => {
    if (!selectedExpense) return;

    const success = await handleReconcile(selectedExpense, selectedInvoices, {
      adjustmentAmount: remainingAmount,
      adjustmentType,
      chartAccountId,
      notes
    });

    if (success) {
      setShowAdjustmentDialog(false);
      setShowInvoiceSearch(false);
      setSelectedExpense(null);
      setSelectedInvoices([]);
    }
  };

  const handleBatchReconciliation = () => {
    if (selectedExpenses.length === 0) return;
    setShowBatchDialog(true);
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses;
  }, [expenses]);

  if (expensesLoading || invoicesLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
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

        <div className="min-w-[120px]">
          <Label>Ordenar por</Label>
          <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'description') => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="amount">Monto</SelectItem>
              <SelectItem value="description">Descripción</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[120px]">
          <Label>Orden</Label>
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descendente</SelectItem>
              <SelectItem value="asc">Ascendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[120px]">
          <Label>Filtrar por</Label>
          <Select value={filterBy} onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setFilterBy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="high">Monto alto</SelectItem>
              <SelectItem value="medium">Monto medio</SelectItem>
              <SelectItem value="low">Monto bajo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedExpenses.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedExpenses.length} gastos seleccionados
              </span>
              <Button onClick={handleBatchReconciliation} size="sm">
                Reconciliar por Lotes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron gastos para reconciliar</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              isSelected={selectedExpenses.some(e => e.id === expense.id)}
              onToggleSelection={() => toggleExpenseSelection(expense)}
              onClick={() => handleExpenseClick(expense)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <ReconciliationPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Dialogs */}
      <InvoiceSearchDialog
        open={showInvoiceSearch}
        onOpenChange={setShowInvoiceSearch}
        expense={selectedExpense}
        invoices={invoices || []}
        onInvoiceSelect={handleInvoiceSelect}
      />

      <SimpleAccountAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        amount={remainingAmount}
        type={adjustmentType}
        onConfirm={handleAdjustmentConfirm}
      />

      <BatchReconciliationDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        selectedExpenses={selectedExpenses}
        availableInvoices={invoices || []}
      />
    </div>
  );
}
