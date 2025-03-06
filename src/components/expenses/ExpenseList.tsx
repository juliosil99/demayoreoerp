
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExpenseTable } from "./components/ExpenseTable";
import { useState, useCallback } from "react";
import { useExpenseDelete } from "./hooks/useExpenseDelete";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
    }
  }[];
};

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { deleteError, handleDelete } = useExpenseDelete();

  const handleOpenDialog = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedExpense(null), 300);
  }, []);

  if (isLoading) {
    return <div>Cargando gastos...</div>;
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>
            {deleteError}
          </AlertDescription>
        </Alert>
      )}
      
      <ExpenseTable 
        expenses={expenses}
        onDelete={handleDelete}
        onEdit={handleOpenDialog}
        isDialogOpen={isDialogOpen}
        selectedExpense={selectedExpense}
        handleCloseDialog={handleCloseDialog}
      />
    </div>
  );
}
