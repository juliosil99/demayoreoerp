
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { ExpenseActions } from "./ExpenseActions";
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

interface ExpenseRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => Promise<void>;
  onEdit: (expense: Expense) => void;
  isDialogOpen: boolean;
  selectedExpense: Expense | null;
  handleCloseDialog: () => void;
}

export function ExpenseRow({ 
  expense,
  onDelete,
  onEdit,
  isDialogOpen,
  selectedExpense,
  handleCloseDialog
}: ExpenseRowProps) {
  return (
    <TableRow key={expense.id}>
      <TableCell>
        {format(new Date(expense.date + 'T00:00:00'), 'MMM dd, yyyy', { locale: es })}
      </TableCell>
      <TableCell>{expense.description}</TableCell>
      <TableCell>${expense.amount.toFixed(2)}</TableCell>
      <TableCell>{expense.bank_accounts.name}</TableCell>
      <TableCell>
        {expense.chart_of_accounts.code} - {expense.chart_of_accounts.name}
      </TableCell>
      <TableCell>{expense.contacts?.name || '-'}</TableCell>
      <TableCell className="capitalize">
        {expense.payment_method === 'cash' ? 'Efectivo' :
          expense.payment_method === 'transfer' ? 'Transferencia' :
          expense.payment_method === 'check' ? 'Cheque' :
          expense.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
          expense.payment_method.replace('_', ' ')}
      </TableCell>
      <TableCell>{expense.reference_number || '-'}</TableCell>
      <TableCell>
        {expense.expense_invoice_relations?.length ? 
          expense.expense_invoice_relations.map(relation => 
            relation.invoice.invoice_number || relation.invoice.uuid
          ).join(', ') : 
          'Sin conciliar'}
      </TableCell>
      <TableCell>
        <ExpenseActions 
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
          isDialogOpen={isDialogOpen}
          selectedExpense={selectedExpense}
          handleCloseDialog={handleCloseDialog}
        />
      </TableCell>
    </TableRow>
  );
}
