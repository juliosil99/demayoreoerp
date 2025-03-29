
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormFields } from "./TransferFormFields";
import { useTransferEdit } from "./hooks/useTransferEdit";
import { AccountTransfersTable } from "@/integrations/supabase/types/account-transfers";
import { AccountCurrency } from "./types";

interface TransferEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: AccountTransfersTable["Row"] | null;
  accounts: Array<{
    id: number;
    name: string;
    balance: number;
    currency: AccountCurrency;
  }>;
}

export function TransferEditDialog({
  open,
  onOpenChange,
  transfer,
  accounts,
}: TransferEditDialogProps) {
  const { formData, setFormData, handleSubmit, isPending } = useTransferEdit(
    transfer,
    () => onOpenChange(false)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Transferencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TransferFormFields 
            formData={formData}
            setFormData={setFormData}
            accounts={accounts}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Actualizando..." : "Actualizar Transferencia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
