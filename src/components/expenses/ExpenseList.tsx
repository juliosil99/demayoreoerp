
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  payment_method: string;
  reference_number: string | null;
}

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  if (isLoading) {
    return <div>Loading expenses...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Bank Account</TableHead>
            <TableHead>Expense Account</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Reference</TableHead>
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
                {expense.payment_method.replace('_', ' ')}
              </TableCell>
              <TableCell>{expense.reference_number || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
