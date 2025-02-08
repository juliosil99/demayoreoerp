
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export type PaymentFormData = {
  date: string;
  amount: string;
  client_id: string;
  account_id: string;
  payment_method: string;
  reference_number: string;
  notes: string;
};

const initialFormData: PaymentFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  amount: "",
  client_id: "",
  account_id: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
};

export function usePaymentForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);

  const createPayment = useMutation({
    mutationFn: async (values: PaymentFormData) => {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const paymentData = {
        ...values,
        user_id: user.id,
        amount: parseFloat(values.amount),
        account_id: parseInt(values.account_id),
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
      toast.success("Pago registrado exitosamente");
      setFormData(initialFormData);
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
      await createPayment.mutateAsync(formData);
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
