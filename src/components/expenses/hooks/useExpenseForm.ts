
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export type TaxDetails = {
  iva: {
    transferred: { rate: number; amount: number };
    retained: { rate: number; amount: number };
    creditable: { rate: number; amount: number };
  };
  isr: {
    retained: { rate: number; amount: number };
  };
  ieps: {
    transferred: { rate: number; amount: number };
    retained: { rate: number; amount: number };
  };
};

export type ExpenseFormData = {
  date: string;
  description: string;
  amount: string;
  account_id: string;
  chart_account_id: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  supplier_id: string;
  category: string;
  tax_amount: string;
  tax_regime: string;
  is_deductible: boolean;
  tax_details: TaxDetails;
};

const initialTaxDetails: TaxDetails = {
  iva: {
    transferred: { rate: 0, amount: 0 },
    retained: { rate: 0, amount: 0 },
    creditable: { rate: 0, amount: 0 }
  },
  isr: {
    retained: { rate: 0, amount: 0 }
  },
  ieps: {
    transferred: { rate: 0, amount: 0 },
    retained: { rate: 0, amount: 0 }
  }
};

const initialFormData: ExpenseFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  description: "",
  amount: "",
  account_id: "",
  chart_account_id: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
  supplier_id: "",
  category: "",
  tax_amount: "",
  tax_regime: "",
  is_deductible: true,
  tax_details: initialTaxDetails,
};

export function useExpenseForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);

  const createExpense = useMutation({
    mutationFn: async (values: ExpenseFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const expenseData = {
        ...values,
        user_id: user.id,
        amount: parseFloat(values.amount),
        tax_amount: values.tax_amount ? parseFloat(values.tax_amount) : null,
        account_id: parseInt(values.account_id),
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Gasto creado exitosamente");
      setFormData(initialFormData);
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
      toast.error("Error al crear el gasto");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Por favor inicia sesión para realizar esta acción");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense.mutateAsync(formData);
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
