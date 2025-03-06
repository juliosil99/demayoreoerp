
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseRow } from "./ExpenseRow";
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

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => Promise<void>;
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
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Cuenta Bancaria</TableHead>
            <TableHead>Cuenta de Gasto</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead>Factura</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
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
