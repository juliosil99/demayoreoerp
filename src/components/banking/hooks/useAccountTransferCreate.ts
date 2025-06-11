
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";
import { TransferFormData } from "../transfer-form/types";

export function useAccountTransferCreate() {
  const { user } = useAuth();
  const { data: userCompany } = useUserCompany();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TransferFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    from_account_id: "",
    to_account_id: "",
    amount_from: "",
    amount_to: "",
    exchange_rate: "1",
    reference_number: "",
    notes: "",
  });

  const createTransfer = useMutation({
    mutationFn: async (data: TransferFormData) => {
      if (!userCompany?.id) {
        throw new Error("No company found for user");
      }

      const { error } = await supabase
        .from("account_transfers")
        .insert({
          date: data.date,
          from_account_id: parseInt(data.from_account_id),
          to_account_id: parseInt(data.to_account_id),
          amount_from: parseFloat(data.amount_from),
          amount_to: parseFloat(data.amount_to || data.amount_from),
          exchange_rate: parseFloat(data.exchange_rate || "1"),
          reference_number: data.reference_number || null,
          notes: data.notes || null,
          user_id: user?.id,
          company_id: userCompany.id,
          // For backward compatibility, also set the amount field
          amount: parseFloat(data.amount_from)
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
        amount_from: "",
        amount_to: "",
        exchange_rate: "1",
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
    
    if (!formData.amount_from || parseFloat(formData.amount_from) <= 0) {
      toast.error("El monto debe ser mayor que cero");
      return;
    }
    
    if (!formData.amount_to || parseFloat(formData.amount_to) <= 0) {
      toast.error("El monto de destino debe ser mayor que cero");
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
