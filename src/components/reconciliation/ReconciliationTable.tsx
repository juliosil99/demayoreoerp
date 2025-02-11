
import { useReconciliation } from "./hooks/useReconciliation";
import { ExpenseCard } from "./components/ExpenseCard";
import { InvoiceSearchDialog } from "./components/InvoiceSearchDialog";
import { AccountAdjustmentDialog } from "./components/AccountAdjustmentDialog";

interface ReconciliationTableProps {
  expenses: any[];
  invoices: any[];
}

export function ReconciliationTable({ expenses, invoices }: ReconciliationTableProps) {
  const {
    selectedExpense,
    setSelectedExpense,
    selectedInvoices,
    remainingAmount,
    showInvoiceSearch,
    setShowInvoiceSearch,
    searchTerm,
    setSearchTerm,
    handleInvoiceSelect,
    showAdjustmentDialog,
    setShowAdjustmentDialog,
    adjustmentType,
    handleAdjustmentConfirm
  } = useReconciliation();

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesIssuer = invoice.issuer_name?.toLowerCase().includes(searchLower);
    const matchesAmount = invoice.total_amount?.toString().includes(searchTerm);
    return matchesIssuer || matchesAmount;
  });

  const handleExpenseSelect = (expense: any) => {
    setSelectedExpense(expense);
    setShowInvoiceSearch(true);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gastos sin Conciliar</h3>
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onSelectExpense={handleExpenseSelect}
          />
        ))}
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
      />

      <AccountAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        amount={Math.abs(remainingAmount)}
        type={adjustmentType}
        onConfirm={handleAdjustmentConfirm}
      />
    </div>
  );
}
