
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Repeat } from "lucide-react";
import { AccountPayable } from "@/types/payables";
import { formatCardDate } from "@/utils/formatters";
import { DeletePayableButton, DeletePayableDialog } from "./DeletePayableDialog";

interface PayableRowProps {
  payable: AccountPayable;
  onMarkAsPaid: (id: string) => void;
  onEdit: (payable: AccountPayable) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
  isDeleting: boolean;
}

export function PayableRow({ 
  payable, 
  onMarkAsPaid, 
  onEdit, 
  onDelete,
  isPending,
  isDeleting 
}: PayableRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // Check if this is a recurring payable
  const isRecurring = payable.is_recurring;
  // Get the series number if available
  const seriesNumber = payable.series_number !== null && payable.series_number !== undefined 
    ? payable.series_number 
    : null;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(payable.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <TableRow key={payable.id}>
      <TableCell>
        {payable.client && (
          <div>
            <div className="font-medium">{payable.client.name}</div>
            <div className="text-sm text-muted-foreground">{payable.client.rfc}</div>
          </div>
        )}
      </TableCell>
      <TableCell>
        {payable.invoice ? (
          <div className="flex items-center space-x-2">
            <div>
              <div>{payable.invoice.invoice_number}</div>
              <div className="text-sm text-muted-foreground">
                {formatCardDate(payable.invoice.invoice_date)}
              </div>
            </div>
            {payable.invoice.id && (
              <a 
                href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/invoices/${payable.invoice.uuid}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <FileText size={16} />
              </a>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin factura</span>
        )}
      </TableCell>
      <TableCell>{formatCurrency(payable.amount)}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <div>{formatCardDate(payable.due_date)}</div>
          {isRecurring && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Repeat className="h-3 w-3 mr-1" />
              {seriesNumber !== null && (
                <span>#{seriesNumber} - </span>
              )}
              <span>
                {payable.recurrence_pattern === 'monthly' && 'Mensual'}
                {payable.recurrence_pattern === 'weekly' && 'Semanal'}
                {payable.recurrence_pattern === 'yearly' && 'Anual'}
              </span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(payable.status)}>
          {payable.status === 'pending' ? 'Pendiente' : 'Pagado'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {payable.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onMarkAsPaid(payable.id)}
                disabled={isPending}
              >
                Marcar como Pagado
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(payable)}
                disabled={isPending}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <DeletePayableButton
                onClick={handleDeleteClick}
                disabled={isPending || isDeleting}
              />
            </>
          )}
        </div>
      </TableCell>
      
      <DeletePayableDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </TableRow>
  );
}
