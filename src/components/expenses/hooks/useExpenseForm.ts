
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { FormExpense } from "../ExpenseForm";

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

export function useExpenseForm(initialExpense?: FormExpense, onSuccess?: () => void) {
  const { user, currentCompany } = useAuth();
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
      if (!currentCompany?.id) throw new Error("No company selected");

      console.log("Fecha antes de crear el expense:", values.date);

      const expenseData = {
        user_id: user.id,
        company_id: currentCompany.id,
        date: values.date,
        description: values.description,
        amount: parseFloat(values.amount),
        account_id: parseInt(values.account_id),
        chart_account_id: values.chart_account_id,
        payment_method: values.payment_method,
        reference_number: values.reference_number || null,
        notes: values.notes || null,
        supplier_id: values.supplier_id || null,
        category: values.category || null,
      };

      console.log("Datos que se envían a Supabase:", expenseData);

      if (initialExpense) {
        const { data, error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq('id', initialExpense.id)
          .select('*, bank_accounts (name), chart_of_accounts (name, code), contacts (name)')
          .single();

        if (error) throw error;
        
        console.log("Respuesta de Supabase (update):", data);
        return data;
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert([expenseData])
          .select('*, bank_accounts (name), chart_of_accounts (name, code), contacts (name)')
          .single();

        if (error) throw error;
        
        console.log("Respuesta de Supabase (insert):", data);
        return data;
      }
    },
    onSuccess: (data) => {
      console.log("Datos después de guardar:", data);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(initialExpense ? "Gasto actualizado exitosamente" : "Gasto creado exitosamente");
      if (!initialExpense) {
        setFormData(initialFormData);
      }
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Error with expense:", error);
      toast.error("Error al procesar el gasto. Por favor, intenta de nuevo.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Por favor inicia sesión para realizar esta acción");
      return;
    }

    if (!formData.chart_account_id) {
      toast.error("Por favor selecciona una cuenta contable");
      return;
    }

    console.log("Fecha en el momento del submit:", formData.date);
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
