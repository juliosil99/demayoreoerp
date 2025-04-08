
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
  // Log dialog events
  useEffect(() => {
    if (isOpen) {
      dialogLogger.logOpen("ExpenseEditDialog", { expenseId: expense.id });
    }
  }, [isOpen, expense]);
  
  // Handle form success separately from dialog closing
  const handleFormSuccess = () => {
    // Log the successful submission but don't close dialog here
    dialogLogger.logClose("ExpenseEditDialog", { expenseId: expense.id, status: "success" });
    // Call the parent success handler which will handle closing
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Modifique los detalles del gasto y guarde los cambios
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm 
          initialData={expense} 
          onSuccess={handleFormSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
