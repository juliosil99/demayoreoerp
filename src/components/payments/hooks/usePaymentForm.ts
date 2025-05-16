
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Payment } from "../PaymentForm";

export type PaymentFormData = {
  date: string;
  amount: string;
  payment_method: string;
  reference_number: string;
  sales_channel_id: string;
  account_id: string;
  notes: string;
  status: "confirmed" | "pending";
};

interface UsePaymentFormProps {
  onSuccess?: () => void;
  paymentToEdit?: Payment | null;
}

export const usePaymentForm = ({ onSuccess, paymentToEdit }: UsePaymentFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormData: PaymentFormData = {
    date: paymentToEdit?.date || new Date().toISOString().split("T")[0],
    amount: paymentToEdit?.amount?.toString() || "",
    payment_method: paymentToEdit?.payment_method || "transfer",
    reference_number: paymentToEdit?.reference_number || "",
    sales_channel_id: paymentToEdit?.sales_channel_id || "",
    account_id: paymentToEdit?.account_id?.toString() || "",
    notes: paymentToEdit?.notes || "",
    status: paymentToEdit?.status || "confirmed"
  };
  
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  
  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data: result, error } = await supabase
        .from("payments")
        .insert([
          {
            date: data.date,
            amount: parseFloat(data.amount),
            payment_method: data.payment_method,
            reference_number: data.reference_number,
            sales_channel_id: data.sales_channel_id || null,
            account_id: parseInt(data.account_id, 10),
            user_id: user.id,
            notes: data.notes,
            status: data.status
          }
        ])
        .select();
      
      if (error) throw error;
      return result?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Pago registrado exitosamente");
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error creando el pago:", error);
      toast.error("Error al registrar el pago");
    },
  });
  
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (!user || !paymentToEdit) throw new Error("User not authenticated or missing payment");
      
      const { data: result, error } = await supabase
        .from("payments")
        .update({
          date: data.date,
          amount: parseFloat(data.amount),
          payment_method: data.payment_method,
          reference_number: data.reference_number,
          sales_channel_id: data.sales_channel_id || null,
          account_id: parseInt(data.account_id, 10),
          notes: data.notes,
          status: data.status
        })
        .eq("id", paymentToEdit.id)
        .select();
      
      if (error) throw error;
      return result?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Pago actualizado exitosamente");
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error actualizando el pago:", error);
      toast.error("Error al actualizar el pago");
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (paymentToEdit) {
        await updatePaymentMutation.mutateAsync(formData);
      } else {
        await createPaymentMutation.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { formData, setFormData, handleSubmit, isSubmitting };
};
