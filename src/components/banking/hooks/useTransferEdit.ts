
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface TransferFormData {
  date: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  reference_number: string;
  notes: string;
}

interface Transfer {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount: number;
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
    updateTransfer.mutate();
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    isPending: updateTransfer.isPending,
  };
}
