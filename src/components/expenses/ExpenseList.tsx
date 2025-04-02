
import { ExpenseTable } from "./components/ExpenseTable";
import { useState, useCallback, useMemo, useRef } from "react";
import { useExpenseDelete } from "./hooks/useExpenseDelete";
import { ExpensePagination } from "./components/ExpensePagination";
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
  console.log('[ExpenseList] Rendering with', expenses.length, 'expenses');
  
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const { deleteError, handleDelete, deleteLog } = useExpenseDelete();
  const operationInProgressRef = useRef(false);

  const handleOpenDialog = useCallback((expense: Expense) => {
    console.log('[ExpenseList] handleOpenDialog called for expense:', expense.id);
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    console.log('[ExpenseList] handleCloseDialog called, operationInProgress:', operationInProgressRef.current);
    if (operationInProgressRef.current) {
      console.log('[ExpenseList] Operation in progress, not closing dialog');
      return;
    }
    
    operationInProgressRef.current = true;
    console.log('[ExpenseList] Setting isDialogOpen to false');
    setIsDialogOpen(false);
    
    // Use requestAnimationFrame to ensure the dialog closes before clearing the selected expense
    requestAnimationFrame(() => {
      console.log('[ExpenseList] In requestAnimationFrame, setting selectedExpense to null');
      setSelectedExpense(null);
      operationInProgressRef.current = false;
    });
  }, []);

  const handleEditSuccess = useCallback(() => {
    console.log('[ExpenseList] handleEditSuccess called');
    // No need for setTimeout, just mark the operation as in progress
    operationInProgressRef.current = true;
  }, []);

  // Get paginated expenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return expenses.slice(startIndex, startIndex + itemsPerPage);
  }, [expenses, currentPage, itemsPerPage]);

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
        onEdit={handleOpenDialog}
        isDialogOpen={isDialogOpen}
        selectedExpense={selectedExpense}
        handleCloseDialog={handleCloseDialog}
        onEditSuccess={handleEditSuccess}
      />

      <ExpensePagination
        totalItems={expenses.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
