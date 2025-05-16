
import { useState } from "react";
import { ExpenseActionMenu } from "./ExpenseActionMenu";
import { ExpenseDeleteDialog } from "./ExpenseDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Expense } from "./types";

interface ExpenseActionsProps {
  expense: Expense;
  onDelete: () => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: () => void;
}

export function ExpenseActions({
  expense,
  onDelete,
  onEdit,
}: ExpenseActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletionLog, setDeletionLog] = useState<string[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const closeLogDialog = () => {
    setIsLogOpen(false);
  };

  return (
    <div className="flex items-center justify-end">
      <ExpenseActionMenu 
        expense={expense}
        onEdit={onEdit}
        onDelete={() => setConfirmOpen(true)}
      />

      <ExpenseDeleteDialog 
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onDelete={handleDeleteClick}
      />

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className={`${isMobile ? "w-[95vw]" : "max-w-2xl"} max-h-[80vh] overflow-y-auto`}>
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
