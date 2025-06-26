import { useState } from "react";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, FileText } from "lucide-react";
import { BatchQuickViewDialog } from "@/components/reconciliation/batches/BatchQuickViewDialog";
import type { Expense } from "./types";

interface ExpenseRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
}

export function ExpenseRow({ expense, onDelete, onEdit }: ExpenseRowProps) {
  const [open, setOpen] = useState(false);

  const handleDeleteClick = () => {
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete(expense);
    setOpen(false);
  };

  const handleEditClick = () => {
    onEdit(expense);
  };

  const [showBatchDetails, setShowBatchDetails] = useState(false);

  const handleBatchClick = () => {
    if (expense.reconciliation_batch_id) {
      setShowBatchDetails(true);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium">{expense.description}</TableCell>
        <TableCell>{expense.bank_accounts?.name}</TableCell>
        <TableCell>{expense.chart_of_accounts?.name}</TableCell>
        <TableCell>{formatCurrency(expense.amount)}</TableCell>
        <TableCell>{expense.contacts?.name}</TableCell>
        <TableCell>
          {expense.reconciled ? (
            <div className="space-y-1">
              {expense.reconciliation_type === 'batch' && expense.reconciliation_batch_id ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchClick}
                  className="h-6 px-2 text-xs hover:bg-blue-50"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Lote de Reconciliación
                </Button>
              ) : (
                <Badge variant="default" className="text-xs">
                  {expense.reconciliation_type === 'manual' ? 'Reconciliado Manualmente' : 'Reconciliado'}
                </Badge>
              )}
              {expense.reconciliation_date && (
                <div className="text-xs text-gray-500">
                  {formatCardDate(expense.reconciliation_date)}
                </div>
              )}
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Sin Reconciliar
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará el gasto permanentemente.
                    ¿Estás seguro de que quieres continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>

      {/* Batch Details Dialog */}
      {expense.reconciliation_batch_id && (
        <BatchQuickViewDialog
          open={showBatchDetails}
          onOpenChange={setShowBatchDetails}
          batchId={expense.reconciliation_batch_id}
        />
      )}
    </>
  );
}
