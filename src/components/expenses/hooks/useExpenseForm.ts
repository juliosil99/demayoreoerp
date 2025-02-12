
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
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
};

export function useExpenseForm(initialExpense?: Expense, onSuccess?: () => void) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);

  useEffect(() => {
    if (initialExpense) {
      setFormData({
        date: format(new Date(initialExpense.date), 'yyyy-MM-dd'),
        description: initialExpense.description,
        amount: initialExpense.amount.toString(),
        account_id: initialExpense.account_id.toString(),
        chart_account_id: initialExpense.chart_account_id,
        payment_method: initialExpense.payment_method,
        reference_number: initialExpense.reference_number || "",
        notes: initialExpense.notes || "",
        supplier_id: initialExpense.supplier_id || "",
        category: initialExpense.category || "",
      });
    }
  }, [initialExpense]);

  const createOrUpdateExpense = useMutation({
    mutationFn: async (values: ExpenseFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const expenseData = {
        ...values,
        user_id: user.id,
        amount: parseFloat(values.amount),
        account_id: parseInt(values.account_id),
        date: values.date, // Enviamos la fecha directamente sin manipulación
      };

      if (initialExpense) {
        const { data, error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq('id', initialExpense.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert([expenseData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(initialExpense ? "Gasto actualizado exitosamente" : "Gasto creado exitosamente");
      if (!initialExpense) {
        setFormData(initialFormData);
      }
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error with expense:", error);
      toast.error(initialExpense ? "Error al actualizar el gasto" : "Error al crear el gasto");
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
      await createOrUpdateExpense.mutateAsync(formData);
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
