
import { parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Payment } from "@/components/payments/PaymentForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatCardDate } from "@/utils/formatters";

type PaymentWithRelations = Payment & {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
};

interface PaymentTableProps {
  payments?: PaymentWithRelations[];
  isLoading: boolean;
  onEdit: (payment: PaymentWithRelations) => void;
  onDelete: (id: string) => void;
}

export function PaymentTable({ payments, isLoading, onEdit, onDelete }: PaymentTableProps) {
  if (isLoading) {
    return <div className="text-center py-4">Cargando pagos...</div>;
  }

  if (!payments?.length) {
    return <div className="text-center py-4">No hay pagos registrados.</div>;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Canal de Venta</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatCardDate(payment.date)}</TableCell>
              <TableCell>{payment.sales_channels?.name || '-'}</TableCell>
              <TableCell>{payment.bank_accounts.name}</TableCell>
              <TableCell>
                {payment.payment_method === 'cash' ? 'Efectivo' :
                 payment.payment_method === 'transfer' ? 'Transferencia' :
                 payment.payment_method === 'check' ? 'Cheque' : 'Tarjeta de Crédito'}
              </TableCell>
              <TableCell>{payment.reference_number || '-'}</TableCell>
              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(payment)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(payment.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
