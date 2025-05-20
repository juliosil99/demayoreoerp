
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExpenseFormData } from "./types";
import type { Expense } from "./types";

export function useExpenseMutation(
  user: { id: string } | null,
  initialExpense: Expense | undefined,
  formData: ExpenseFormData,
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>,
  initialFormData: ExpenseFormData,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ExpenseFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const originalAmount = parseFloat(values.original_amount);
      const exchangeRate = parseFloat(values.exchange_rate);
      
      // Calculate the MXN amount if currency is not MXN
      let amount = values.currency === "MXN" 
        ? originalAmount 
        : originalAmount * exchangeRate;
      
      // Apply negative sign for returns/refunds
      let finalOriginalAmount = originalAmount;
      if (values.isReturn) {
        amount = -Math.abs(amount);
        finalOriginalAmount = -Math.abs(originalAmount);
      }

      const expenseData = {
        user_id: user.id,
        date: values.date,
        description: values.description,
        amount: amount,
        original_amount: finalOriginalAmount,
        account_id: parseInt(values.account_id),
        chart_account_id: values.chart_account_id,
        payment_method: values.payment_method,
        reference_number: values.reference_number || null,
        notes: values.notes || null,
        supplier_id: values.supplier_id || null,
        category: values.category || null,
        currency: values.currency,
        exchange_rate: exchangeRate,
      };

      if (initialExpense) {
        const { data, error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq('id', initialExpense.id)
          .select('*, bank_accounts (name, currency), chart_of_accounts (name, code), contacts (name)')
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert([expenseData])
          .select('*, bank_accounts (name, currency), chart_of_accounts (name, code), contacts (name)')
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      
      // Update success message based on if this is a return/refund
      const actionText = initialExpense ? "actualizado" : "creado";
      const typeText = formData.isReturn ? "Reembolso" : "Gasto";
      toast.success(`${typeText} ${actionText} exitosamente`);
      
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
}
