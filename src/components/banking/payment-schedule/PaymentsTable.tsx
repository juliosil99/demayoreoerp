
import React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters";

export interface CreditPayment {
  id: string;
  account_id: number;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  payment_id?: string;
  created_at: string;
}

interface PaymentsTableProps {
  payments: CreditPayment[];
  onDeletePayment: (paymentId: string) => void;
}

export function PaymentsTable({ payments, onDeletePayment }: PaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {format(parseISO(payment.due_date), 'd MMMM yyyy', { locale: es })}
            </TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>
              <Badge 
                variant={
                  payment.status === 'paid' ? 'default' :
                  payment.status === 'overdue' ? 'destructive' : 'outline'
                }
              >
                {payment.status === 'paid' ? 'Pagado' :
                 payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {payment.status !== 'paid' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar este pago?')) {
                      onDeletePayment(payment.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
