
import React, { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TransferEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: {
    id: string;
    date: string;
    from_account_id: number;
    to_account_id: number;
    amount: number;
    reference_number?: string;
    notes?: string;
  } | null;
  accounts: Array<{
    id: number;
    name: string;
    balance: number;
  }>;
}

export function TransferEditDialog({
  open,
  onOpenChange,
  transfer,
  accounts,
}: TransferEditDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: "",
    from_account_id: "",
    to_account_id: "",
    amount: "",
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    if (transfer) {
      setFormData({
        date: format(new Date(transfer.date), "yyyy-MM-dd"),
        from_account_id: String(transfer.from_account_id),
        to_account_id: String(transfer.to_account_id),
        amount: String(transfer.amount),
        reference_number: transfer.reference_number || "",
        notes: transfer.notes || "",
      });
    }
  }, [transfer]);

  const updateTransfer = useMutation({
    mutationFn: async () => {
      if (!transfer) return;

      const { error } = await supabase
        .from("account_transfers")
        .update({
          date: formData.date,
          from_account_id: parseInt(formData.from_account_id),
          to_account_id: parseInt(formData.to_account_id),
          amount: parseFloat(formData.amount),
          reference_number: formData.reference_number || null,
          notes: formData.notes || null,
        })
        .eq("id", transfer.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transferencia actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-transactions"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error al actualizar la transferencia: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_account_id === formData.to_account_id) {
      toast.error("Las cuentas de origen y destino deben ser diferentes");
      return;
    }
    updateTransfer.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Transferencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cuenta Origen</Label>
              <Select
                value={formData.from_account_id}
                onValueChange={(value) => setFormData({ ...formData, from_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - ${account.balance?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cuenta Destino</Label>
              <Select
                value={formData.to_account_id}
                onValueChange={(value) => setFormData({ ...formData, to_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - ${account.balance?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Número de Referencia</Label>
            <Input
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Número de referencia (opcional)"
            />
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales (opcional)"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updateTransfer.isPending}>
              {updateTransfer.isPending
                ? "Actualizando..."
                : "Actualizar Transferencia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
