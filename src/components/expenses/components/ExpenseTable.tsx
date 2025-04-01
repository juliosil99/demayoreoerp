
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { ExpenseRow } from "./ExpenseRow";
import { ExpenseTableHeader } from "./ExpenseTableHeader";
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
};

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
  isDialogOpen: boolean;
  selectedExpense: Expense | null;
  handleCloseDialog: () => void;
}

export function ExpenseTable({ 
  expenses,
  onDelete,
  onEdit,
  isDialogOpen,
  selectedExpense,
  handleCloseDialog
}: ExpenseTableProps) {
  return (
    <div className="overflow-hidden rounded-md">
      <Table>
        <ExpenseTableHeader />
        <TableBody>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onDelete={onDelete}
              onEdit={onEdit}
              isDialogOpen={isDialogOpen}
              selectedExpense={selectedExpense}
              handleCloseDialog={handleCloseDialog}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
