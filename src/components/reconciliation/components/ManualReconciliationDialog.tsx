
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { ManualReconciliationDialogForm } from "./ManualReconciliationDialogForm";

interface ManualReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any | null;
  onConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;
  chartAccounts: { id: string; name: string; code: string }[];
}

export function ManualReconciliationDialog({
  open,
  onOpenChange,
  expense,
  onConfirm,
  chartAccounts,
}: ManualReconciliationDialogProps) {
  if (!expense) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reconciliación Manual</DialogTitle>
          <DialogDescription>
            Gasto: {expense.description} - {formatCurrency(expense.amount)} ({formatCardDate(expense.date)})
          </DialogDescription>
        </DialogHeader>

        <ManualReconciliationDialogForm
          expense={expense}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
          chartAccounts={chartAccounts}
        />
      </DialogContent>
    </Dialog>
  );
}
