
import { parseISO } from "date-fns";
import { Check, Clock, Pencil, Trash2, RefreshCw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
  onStatusUpdate?: (id: string, status: 'confirmed' | 'pending') => void;
}

export function PaymentTable({ 
  payments, 
  isLoading, 
  onEdit, 
  onDelete,
  onStatusUpdate 
}: PaymentTableProps) {
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
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            // Check if this is a return (negative amount)
            const isReturn = payment.amount < 0;
            
            return (
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
                <TableCell>
                  <Badge 
                    variant={payment.status === 'confirmed' ? 'default' : 'outline'} 
                    className={payment.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-300'}
                  >
                    <span className="flex items-center gap-1">
                      {payment.status === 'confirmed' ? (
                        <>
                          <Check className="h-3 w-3" />
                          Confirmado
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Pendiente
                        </>
                      )}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {isReturn ? (
                    <Badge 
                      variant="outline" 
                      className="bg-red-50 text-red-800 hover:bg-red-100 border-red-300"
                    >
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Devolución
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      Ingreso
                    </Badge>
                  )}
                </TableCell>
                <TableCell 
                  className={`text-right font-medium ${isReturn ? 'text-red-600' : ''}`}
                >
                  {formatCurrency(Math.abs(payment.amount))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onStatusUpdate && payment.status !== 'confirmed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStatusUpdate(payment.id, 'confirmed')}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Confirmar pago"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {onStatusUpdate && payment.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStatusUpdate(payment.id, 'pending')}
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        title="Marcar como pendiente"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
