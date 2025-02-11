
import { OldestExpense } from "@/hooks/dashboard/useOldestExpense";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OldestExpenseCardProps {
  expense: OldestExpense | null;
  formatDate: (date: string | null) => string;
  formatCurrency: (amount: number | null) => string;
}

export const OldestExpenseCard = ({ expense, formatDate, formatCurrency }: OldestExpenseCardProps) => {
  if (!expense) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gasto más Antiguo por Conciliar</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{formatDate(expense.date)}</TableCell>
              <TableCell>{expense.description || '-'}</TableCell>
              <TableCell>{expense.payment_method || '-'}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.amount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
