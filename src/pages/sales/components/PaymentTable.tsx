
import { format } from "date-fns";
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
import { formatCurrency } from "@/utils/formatters";

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

  // Helper function to safely format dates with the correct locale
  const formatDate = (dateString: string) => {
    try {
      console.log('DEBUG DATE - Original date string:', dateString);
      
      // Create a date object from the string
      const date = new Date(dateString);
      console.log('DEBUG DATE - JS Date object:', date.toString());
      console.log('DEBUG DATE - Date components:', {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // +1 because months are 0-indexed
        day: date.getDate(),
        fullISO: date.toISOString()
      });
      
      // Format it as day/month/year (Mexican format)
      const formattedDate = format(date, 'dd/MM/yyyy');
      console.log('DEBUG DATE - Formatted result:', formattedDate);
      
      return formattedDate;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString || '-';
    }
  };

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
              <TableCell>{formatDate(payment.date)}</TableCell>
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
