
import { TableCell, TableRow } from "@/components/ui/table";
import { ExpenseActions } from "./ExpenseActions";
import { Badge } from "@/components/ui/badge";
import { formatCardDate } from "@/utils/formatters";
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

interface ExpenseRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
  isDialogOpen: boolean;
  selectedExpense: Expense | null;
  handleCloseDialog: () => void;
  onEditSuccess: () => void; // Add this new prop
}

export function ExpenseRow({ 
  expense,
  onDelete,
  onEdit,
  isDialogOpen,
  selectedExpense,
  handleCloseDialog,
  onEditSuccess
}: ExpenseRowProps) {

  const handleDeleteClick = async () => {
    return onDelete(expense);
  };

  // Check if the expense comes from a payable
  const isFromPayable = !!expense.accounts_payable;

  return (
    <TableRow key={expense.id} className={isFromPayable ? "bg-gray-300" : "odd:bg-gray-300 even:bg-gray-300"}>
      <TableCell>{formatCardDate(expense.date)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {expense.description}
          {isFromPayable && (
            <div className="ml-2">
              <Badge className="bg-blue-200 text-blue-800 rounded-full px-2 py-1 text-xs">
                Cuenta por Pagar
              </Badge>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
      <TableCell>{expense.bank_accounts.name}</TableCell>
      <TableCell>
        <span className="whitespace-nowrap">
          {expense.chart_of_accounts.code} - {expense.chart_of_accounts.name}
        </span>
      </TableCell>
      <TableCell>
        {expense.contacts?.name || (isFromPayable && expense.accounts_payable?.client?.name) || '-'}
      </TableCell>
      <TableCell className="capitalize whitespace-nowrap">
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
          expense.reconciled ? 'Conciliación manual' : 'Sin conciliar'}
      </TableCell>
      <TableCell>
        <ExpenseActions 
          expense={expense}
          onDelete={handleDeleteClick}
          onEdit={onEdit}
          isDialogOpen={isDialogOpen}
          selectedExpense={selectedExpense}
          handleCloseDialog={handleCloseDialog}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
}
