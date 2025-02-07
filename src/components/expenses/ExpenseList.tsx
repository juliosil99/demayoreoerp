
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  if (isLoading) {
    return <div>Cargando gastos...</div>;
  }

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
