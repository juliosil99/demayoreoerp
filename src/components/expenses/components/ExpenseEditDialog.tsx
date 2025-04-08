
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { dialogLogger } from "@/utils/dialogLogger";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
};

interface ExpenseEditDialogProps {
  isOpen: boolean;
  expense: Expense;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseEditDialog({ 
  isOpen, 
  expense, 
  onOpenChange, 
  onSuccess 
}: ExpenseEditDialogProps) {
  // Log dialog events - only when opening
  useEffect(() => {
    if (isOpen) {
      dialogLogger.logOpen("ExpenseEditDialog", { expenseId: expense.id });
    }
  }, [isOpen, expense]);
  
  // We need to handle dialog closing separately from form success
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Log closing event through normal dialog close (X button or escape key)
      dialogLogger.logClose("ExpenseEditDialog", { expenseId: expense.id, status: "cancelled" });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Modifique los detalles del gasto y guarde los cambios
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm 
          initialData={expense} 
          onSuccess={() => {
            // Log success and then notify parent
            dialogLogger.logClose("ExpenseEditDialog", { expenseId: expense.id, status: "success" });
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
