
import { useState } from "react";
import { ExpenseActionMenu } from "./ExpenseActionMenu";
import { ExpenseDeleteDialog } from "./ExpenseDeleteDialog";
import { ExpenseEditDialog } from "./ExpenseEditDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface ExpenseActionsProps {
  expense: Expense;
  onDelete: () => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
  isDialogOpen: boolean;
  selectedExpense: Expense | null;
  handleCloseDialog: () => void;
  onEditSuccess: () => void; // Add this new prop
}

export function ExpenseActions({
  expense,
  onDelete,
  onEdit,
  isDialogOpen,
  selectedExpense,
  handleCloseDialog,
  onEditSuccess
}: ExpenseActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletionLog, setDeletionLog] = useState<string[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const handleDeleteClick = async () => {
    try {
      const result = await onDelete();
      if (result && 'success' in result && !result.success) {
        setDeletionLog(result.log);
        setIsLogOpen(true);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  const handleEditClick = () => {
    onEdit(expense);
  };

  const closeLogDialog = () => {
    setIsLogOpen(false);
  };

  return (
    <div className="flex items-center justify-end">
      <ExpenseActionMenu 
        expense={expense}
        onEdit={handleEditClick}
        onDelete={() => setConfirmOpen(true)}
      />

      <ExpenseDeleteDialog 
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onDelete={handleDeleteClick}
      />

      {isDialogOpen && selectedExpense?.id === expense.id && (
        <ExpenseEditDialog
          isOpen={isDialogOpen}
          expense={selectedExpense}
          onClose={handleCloseDialog}
          onSuccess={onEditSuccess}
        />
      )}

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log de eliminación del gasto</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm">
            <div className="bg-gray-100 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
              {deletionLog.map((line, index) => (
                <div key={index} className="mb-1">{line}</div>
              ))}
            </div>
            <p className="mt-4 text-red-500">
              Por favor, comparte este log con el soporte técnico para resolver el problema.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button onClick={closeLogDialog}>Cerrar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
