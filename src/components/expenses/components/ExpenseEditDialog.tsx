
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
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
  expense: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseEditDialog({ isOpen, expense, onClose, onSuccess }: ExpenseEditDialogProps) {
  console.log('[ExpenseEditDialog] Rendering with isOpen:', isOpen, 'expense:', expense?.id);
  
  if (!expense) return null;
  
  const handleFormSuccess = () => {
    console.log('[ExpenseEditDialog] Form submitted successfully, closing dialog');
    onSuccess();
    onClose();
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          console.log('[ExpenseEditDialog] Dialog closing via onOpenChange');
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
        </DialogHeader>
        <ExpenseForm 
          initialData={expense} 
          onSuccess={handleFormSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
