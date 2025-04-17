
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TransferFormData } from "../types";

export function useAccountTransferCreate() {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    date: new Date().toISOString().split("T")[0],
    from_account_id: "",
    to_account_id: "",
    amount_from: "",
    amount_to: "",
    exchange_rate: "1",
    reference_number: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Debes iniciar sesión para realizar transferencias");
      return;
    }

    if (!formData.from_account_id || !formData.to_account_id) {
      toast.error("Selecciona las cuentas de origen y destino");
      return;
    }

    if (!formData.amount_from || parseFloat(formData.amount_from) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (formData.from_account_id === formData.to_account_id) {
      toast.error("Las cuentas de origen y destino no pueden ser la misma");
      return;
    }

    setIsPending(true);

    try {
      const transferData = {
        date: formData.date,
        from_account_id: parseInt(formData.from_account_id),
        to_account_id: parseInt(formData.to_account_id),
        amount_from: parseFloat(formData.amount_from),
        amount_to: parseFloat(formData.amount_to),
        exchange_rate: parseFloat(formData.exchange_rate),
        reference_number: formData.reference_number,
        notes: formData.notes,
        user_id: user.id,
        status: "completed",
        amount: parseFloat(formData.amount_from), // Required field
      };

      const { error } = await supabase
        .from("account_transfers")
        .insert(transferData);

      if (error) throw error;
      
      toast.success("Transferencia realizada con éxito");
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        from_account_id: "",
        to_account_id: "",
        amount_from: "",
        amount_to: "",
        exchange_rate: "1",
        reference_number: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating transfer:", error);
      toast.error("Error al realizar la transferencia");
    } finally {
      setIsPending(false);
    }
  };

  return { formData, setFormData, handleSubmit, isPending };
}
