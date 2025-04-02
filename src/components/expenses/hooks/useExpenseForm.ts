
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
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
  const [formData, setFormData] = useState<ExpenseFormData>({...initialFormData});

  useEffect(() => {
    if (initialExpense) {
      // Ensure the date is in YYYY-MM-DD format (ISO)
      // This prevents timezone issues when editing expenses
      const rawDate = new Date(initialExpense.date);
      const year = rawDate.getUTCFullYear();
      const month = String(rawDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(rawDate.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setFormData({
        date: formattedDate,
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

  // Function to set the chart account ID directly
  const setChartAccountId = (chartAccountId: string) => {
    setFormData(prev => ({
      ...prev,
      chart_account_id: chartAccountId
    }));
  };

  const createOrUpdateExpense = useMutation({
    mutationFn: async (values: ExpenseFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const expenseData = {
        user_id: user.id,
        date: values.date, // This is already in YYYY-MM-DD format from the input
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

      if (initialExpense) {
        const { data, error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq('id', initialExpense.id)
          .select('*, bank_accounts (name), chart_of_accounts (name, code), contacts (name)')
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert([expenseData])
          .select('*, bank_accounts (name), chart_of_accounts (name, code), contacts (name)')
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(initialExpense ? "Gasto actualizado exitosamente" : "Gasto creado exitosamente");
      
      if (!initialExpense) {
        setFormData({...initialFormData});
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      console.error("Error saving expense:", error);
      toast.error("Error al procesar el gasto. Por favor, intenta de nuevo.");
      setIsSubmitting(false);
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

    setIsSubmitting(true);
    await createOrUpdateExpense.mutateAsync(formData);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    setChartAccountId,
  };
}
