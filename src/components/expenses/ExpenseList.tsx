
import { ExpenseTable } from "./components/ExpenseTable";
import { useState, useCallback } from "react";
import { useExpenseDelete } from "./hooks/useExpenseDelete";
import { ExpensePagination } from "./components/ExpensePagination";
import { ExpenseEditDialog } from "./components/ExpenseEditDialog";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
  accounts_payable?: {
    id: string;
    client: {
      name: string;
    };
  };
};

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const { deleteError, handleDelete, deleteLog } = useExpenseDelete();

  // Get paginated expenses
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + itemsPerPage);

  const handleEditExpense = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Don't clear selectedExpense here to prevent UI flicker during animation
  }, []);

  const handleEditSuccess = useCallback(() => {
    // This will be called after successful edit
    setIsDialogOpen(false);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isLoading) {
    return <div>Cargando gastos...</div>;
  }

  return (
    <div className="space-y-4">
      <ExpenseTable 
        expenses={paginatedExpenses}
        onDelete={handleDelete}
        onEdit={handleEditExpense}
      />

      <ExpensePagination
        totalItems={expenses.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {selectedExpense && (
        <ExpenseEditDialog
          isOpen={isDialogOpen}
          expense={selectedExpense}
          onClose={handleCloseDialog}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
