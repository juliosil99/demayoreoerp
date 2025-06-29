import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Repeat, AlertCircle, Bug } from "lucide-react";
import { AccountPayable } from "@/types/payables";
import { formatCardDate } from "@/utils/formatters";
import { DeletePayableButton, DeletePayableDialog } from "./DeletePayableDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePayableDebug } from "../hooks/usePayableDebug";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { debugPayable, isDebugging, debugResults } = usePayableDebug();

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

  // Check if this could be the last recurring payment in the series
  const isNearEndOfSeries = isRecurring && payable.recurrence_end_date &&
    new Date(payable.recurrence_end_date).getTime() - new Date(payable.due_date).getTime() < 30 * 24 * 60 * 60 * 1000;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(payable.id);
    setIsDeleteDialogOpen(false);
  };

  const handleDebugClick = async () => {
    await debugPayable(payable.id);
  };

  const handleMarkAsPaid = async () => {
    if (isProcessing || isPending) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await onMarkAsPaid(payable.id);
    } finally {
      // Keep processing state for a bit to prevent double clicks
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  // Check if the button should be disabled
  const isPayButtonDisabled = isProcessing || isPending || payable.status === 'paid';

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
          <div className="flex items-center gap-1">
            {formatCardDate(payable.due_date)}
            {isNearEndOfSeries && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este es posiblemente el último pago de la serie</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={handleMarkAsPaid}
                      disabled={isPayButtonDisabled}
                      className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {isProcessing ? "Procesando..." : "Marcar como Pagado"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPayButtonDisabled ? (
                      isProcessing ? "Procesando pago..." : "Ya está siendo procesado"
                    ) : (
                      "Marcar como pagado y crear gasto automáticamente"
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(payable)}
                disabled={isPending || isProcessing}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <DeletePayableButton
                onClick={handleDeleteClick}
                disabled={isPending || isDeleting || isProcessing}
              />
            </>
          )}
          {/* Debug button - only show in development or for troubleshooting */}
          {process.env.NODE_ENV === 'development' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDebugClick}
                    disabled={isDebugging}
                  >
                    <Bug className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Debug payable expenses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      
      <DeletePayableDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
      
      {/* Enhanced debug results display */}
      {debugResults && (
        <div className="fixed top-4 right-4 bg-white border rounded-lg p-4 shadow-lg z-50 max-w-md">
          <h3 className="font-semibold mb-2">Enhanced Debug Results</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugResults, null, 2)}
          </pre>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.reload()}>
            Close
          </Button>
        </div>
      )}
    </TableRow>
  );
}
