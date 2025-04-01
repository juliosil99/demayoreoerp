
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PayableForm } from "../PayableForm";
import { PayableFormData } from "../PayableForm";

interface PayableFormDialogProps {
  onSubmit: (data: PayableFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

export function PayableFormDialog({ onSubmit, isSubmitting }: PayableFormDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (data: PayableFormData) => {
    const success = await onSubmit(data);
    if (success) {
      setDialogOpen(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nueva Cuenta por Pagar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta por Pagar</DialogTitle>
        </DialogHeader>
        <PayableForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
