
import { TableCell, TableRow } from "@/components/ui/table";
import { ExpenseActions } from "./ExpenseActions";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCardDate } from "@/utils/formatters";
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

interface ExpenseRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
  isDialogOpen: boolean;
  selectedExpense: Expense | null;
  handleCloseDialog: () => void;
}

export function ExpenseRow({ 
  expense,
  onDelete,
  onEdit,
  isDialogOpen,
  selectedExpense,
  handleCloseDialog
}: ExpenseRowProps) {
  const [deletionLog, setDeletionLog] = useState<string[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const handleDeleteClick = async () => {
    try {
      const result = await onDelete(expense);
      if (result && !result.success) {
        setDeletionLog(result.log);
        setIsLogOpen(true);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  const closeLogDialog = () => {
    setIsLogOpen(false);
  };

  return (
    <>
      <TableRow key={expense.id}>
        <TableCell>
          {formatCardDate(expense.date)}
        </TableCell>
        <TableCell>{expense.description}</TableCell>
        <TableCell>${expense.amount.toFixed(2)}</TableCell>
        <TableCell>{expense.bank_accounts.name}</TableCell>
        <TableCell>
          {expense.chart_of_accounts.code} - {expense.chart_of_accounts.name}
        </TableCell>
        <TableCell>{expense.contacts?.name || '-'}</TableCell>
        <TableCell className="capitalize">
          {expense.payment_method === 'cash' ? 'Efectivo' :
            expense.payment_method === 'transfer' ? 'Transferencia' :
            expense.payment_method === 'check' ? 'Cheque' :
            expense.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
            expense.payment_method.replace('_', ' ')}
        </TableCell>
        <TableCell>{expense.reference_number || '-'}</TableCell>
        <TableCell>
          {expense.expense_invoice_relations?.length ? 
            expense.expense_invoice_relations.map(relation => 
              relation.invoice.invoice_number || relation.invoice.uuid
            ).join(', ') : 
            expense.reconciled ? 'Conciliación manual' : 'Sin conciliar'}
        </TableCell>
        <TableCell>
          <ExpenseActions 
            expense={expense}
            onDelete={handleDeleteClick}
            onEdit={onEdit}
            isDialogOpen={isDialogOpen}
            selectedExpense={selectedExpense}
            handleCloseDialog={handleCloseDialog}
          />
        </TableCell>
      </TableRow>

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
    </>
  );
}
