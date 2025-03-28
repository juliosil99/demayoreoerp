
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface TransferFormData {
  date: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  reference_number: string;
  notes: string;
}

export function useAccountTransferCreate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TransferFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    from_account_id: "",
    to_account_id: "",
    amount: "",
    reference_number: "",
    notes: "",
  });

  const createTransfer = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const { error } = await supabase
        .from("account_transfers")
        .insert({
          ...data,
          amount: parseFloat(data.amount),
          from_account_id: parseInt(data.from_account_id),
          to_account_id: parseInt(data.to_account_id),
          user_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-transfers"] });
      toast.success("Transferencia realizada con éxito");
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        from_account_id: "",
        to_account_id: "",
        amount: "",
        reference_number: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Error al realizar la transferencia: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_account_id === formData.to_account_id) {
      toast.error("Las cuentas de origen y destino deben ser diferentes");
      return;
    }
    createTransfer.mutate(formData);
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    isPending: createTransfer.isPending
  };
}
