
import React from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    due_date: string;
    amount: number;
  };
  onPaymentChange: (payment: { due_date: string; amount: number }) => void;
  onSave: () => void;
}

export function AddPaymentDialog({ 
  open, 
  onOpenChange, 
  payment, 
  onPaymentChange, 
  onSave 
}: AddPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Pago Programado</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Fecha de Pago</Label>
            <Input
              id="date"
              type="date"
              value={payment.due_date}
              onChange={(e) => onPaymentChange({ ...payment, due_date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={payment.amount}
              onChange={(e) => onPaymentChange({ 
                ...payment, 
                amount: parseFloat(e.target.value) || 0 
              })}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onSave}
            disabled={!payment.due_date || payment.amount <= 0}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
