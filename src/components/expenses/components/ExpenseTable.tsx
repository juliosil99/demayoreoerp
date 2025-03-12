
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { ExpenseRow } from "./ExpenseRow";
import { ExpenseTableHeader } from "./ExpenseTableHeader";
import { Expense } from "../types/expense";

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
    <div className="rounded-md border">
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
