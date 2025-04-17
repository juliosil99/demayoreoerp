import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { TransferFormData } from "../types";

export function useAccountTransferCreate() {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    date: new Date().toISOString().split('T')[0],
    from_account_id: "",
    to_account_id: "",
    amount_from: "",
    amount_to: "",
    exchange_rate: "1",
    reference_number: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const { date, from_account_id, to_account_id, amount_from, amount_to, exchange_rate, reference_number, notes } = formData;

      // Validate required fields
      if (!date || !from_account_id || !to_account_id || !amount_from || !amount_to) {
        throw new Error("Por favor, complete todos los campos requeridos.");
      }

      const { data, error } = await supabase
        .from('account_transfers')
        .insert([
          {
            date,
            from_account_id: parseInt(from_account_id),
            to_account_id: parseInt(to_account_id),
            amount_from: parseFloat(amount_from),
            amount_to: parseFloat(amount_to),
            exchange_rate: parseFloat(exchange_rate),
            reference_number,
            notes,
            user_id: user!.id,
            status: 'completed'
          }
        ])
        .select()

      if (error) {
        throw error;
      }

      toast.success("Transferencia realizada exitosamente!");
      setFormData({
        date: new Date().toISOString().split('T')[0],
        from_account_id: "",
        to_account_id: "",
        amount_from: "",
        amount_to: "",
        exchange_rate: "1",
        reference_number: "",
        notes: ""
      });
    } catch (error: any) {
      console.error("Error creating transfer:", error);
      toast.error("Error al realizar la transferencia: " + error.message);
    } finally {
      setIsPending(false);
    }
  };
  
  return { formData, setFormData, handleSubmit, isPending };
}
