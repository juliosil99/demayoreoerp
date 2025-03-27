
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Payment } from "../PaymentForm";

export type PaymentFormData = {
  date: string;
  amount: string;
  sales_channel_id: string;
  account_id: string;
  payment_method: string;
  reference_number: string;
  notes: string;
};

const initialFormData: PaymentFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  amount: "",
  sales_channel_id: "",
  account_id: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
};

interface UsePaymentFormProps {
  onSuccess?: () => void;
  paymentToEdit?: Payment | null;
}

export function usePaymentForm({ onSuccess, paymentToEdit }: UsePaymentFormProps = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);

  useEffect(() => {
    if (paymentToEdit) {
      // Ensure date is properly formatted for input (yyyy-MM-dd)
      const formattedDate = paymentToEdit.date 
        ? format(new Date(paymentToEdit.date), 'yyyy-MM-dd') 
        : format(new Date(), 'yyyy-MM-dd');
      
      setFormData({
        date: formattedDate,
        amount: paymentToEdit.amount.toString(),
        sales_channel_id: paymentToEdit.sales_channel_id || "",
        account_id: paymentToEdit.account_id.toString(),
        payment_method: paymentToEdit.payment_method,
        reference_number: paymentToEdit.reference_number || "",
        notes: paymentToEdit.notes || "",
      });
    }
  }, [paymentToEdit]);

  const updatePayment = useMutation({
    mutationFn: async (values: PaymentFormData & { id: string }) => {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("payments")
        .update({
          date: values.date,
          amount: parseFloat(values.amount),
          sales_channel_id: values.sales_channel_id || null,
          account_id: parseInt(values.account_id),
          payment_method: values.payment_method,
          reference_number: values.reference_number || null,
          notes: values.notes || null,
        })
        .eq('id', values.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-count"] });
      toast.success("Pago actualizado exitosamente");
      setFormData(initialFormData);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error al actualizar el pago:", error);
      toast.error("Error al actualizar el pago");
    },
  });

  const createPayment = useMutation({
    mutationFn: async (values: PaymentFormData) => {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const paymentData = {
        user_id: user.id,
        date: values.date,
        amount: parseFloat(values.amount),
        sales_channel_id: values.sales_channel_id || null,
        account_id: parseInt(values.account_id),
        payment_method: values.payment_method,
        reference_number: values.reference_number || null,
        notes: values.notes || null,
      };

      const { data, error } = await supabase
        .from("payments")
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-count"] });
      toast.success("Pago registrado exitosamente");
      setFormData(initialFormData);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error al registrar el pago:", error);
      toast.error("Error al registrar el pago");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Por favor inicie sesión para realizar esta acción");
      return;
    }

    setIsSubmitting(true);
    try {
      if (paymentToEdit) {
        await updatePayment.mutateAsync({ ...formData, id: paymentToEdit.id });
      } else {
        await createPayment.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
  };
}
