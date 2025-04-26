
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/utils/formatters";

interface ReconciliationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedCount: number;
  totalAmount: number;
}

export function ReconciliationConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
  totalAmount,
}: ReconciliationConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Reconciliación</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas reconciliar {selectedCount} ventas por un total de {formatCurrency(totalAmount)}?
            <br /><br />
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirmar Reconciliación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
