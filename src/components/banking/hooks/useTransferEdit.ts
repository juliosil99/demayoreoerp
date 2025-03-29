
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { TransferFormData } from "../transfer-form/types";

interface Transfer {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount_from?: number;
  amount_to?: number;
  amount?: number; // For backward compatibility
  exchange_rate?: number;
  reference_number?: string;
  notes?: string;
}

export function useTransferEdit(
  transfer: Transfer | null,
  onClose: () => void
) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TransferFormData>({
    date: "",
    from_account_id: "",
    to_account_id: "",
    amount_from: "",
    amount_to: "",
    exchange_rate: "1",
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    if (transfer) {
      // Handle both new format (amount_from/amount_to) and old format (amount)
      const amountFrom = transfer.amount_from !== undefined ? transfer.amount_from : transfer.amount || 0;
      const amountTo = transfer.amount_to !== undefined ? transfer.amount_to : transfer.amount || 0;
      const exchangeRate = transfer.exchange_rate || 1;

      setFormData({
        date: format(new Date(transfer.date), "yyyy-MM-dd"),
        from_account_id: String(transfer.from_account_id),
        to_account_id: String(transfer.to_account_id),
        amount_from: String(amountFrom),
        amount_to: String(amountTo),
        exchange_rate: String(exchangeRate),
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
          amount_from: parseFloat(formData.amount_from),
          amount_to: parseFloat(formData.amount_to || formData.amount_from),
          exchange_rate: parseFloat(formData.exchange_rate || "1"),
          reference_number: formData.reference_number || null,
          notes: formData.notes || null,
          // For backward compatibility, also update the amount field
          amount: parseFloat(formData.amount_from)
        })
        .eq("id", transfer.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transferencia actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-transactions"] });
      onClose();
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
    
    if (!formData.amount_from || parseFloat(formData.amount_from) <= 0) {
      toast.error("El monto debe ser mayor que cero");
      return;
    }
    
    if (!formData.amount_to || parseFloat(formData.amount_to) <= 0) {
      toast.error("El monto de destino debe ser mayor que cero");
      return;
    }
    
    updateTransfer.mutate();
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    isPending: updateTransfer.isPending,
  };
}
