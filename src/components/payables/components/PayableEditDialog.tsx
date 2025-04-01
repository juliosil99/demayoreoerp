
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PayableForm } from "../PayableForm";
import { PayableFormData } from "../types/payableTypes";
import { AccountPayable } from "@/types/payables";

interface PayableEditDialogProps {
  payable: AccountPayable | null;
  onClose: () => void;
  onSubmit: (id: string, data: PayableFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

export function PayableEditDialog({ payable, onClose, onSubmit, isSubmitting }: PayableEditDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(!!payable);

  useEffect(() => {
    setDialogOpen(!!payable);
  }, [payable]);

  const handleClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const handleSubmit = async (data: PayableFormData) => {
    if (!payable) return;
    
    const success = await onSubmit(payable.id, data);
    if (success) {
      setDialogOpen(false);
      onClose();
    }
  };

  // Convert the payable to form data format
  const getInitialData = (): PayableFormData | undefined => {
    if (!payable) return undefined;

    return {
      client_id: payable.client_id || "",
      invoice_id: payable.invoice_id || null,
      amount: payable.amount,
      payment_term: payable.payment_term,
      notes: payable.notes || "",
      due_date: new Date(payable.due_date),
    };
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Cuenta por Pagar</DialogTitle>
        </DialogHeader>
        {payable && (
          <PayableForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={getInitialData()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
