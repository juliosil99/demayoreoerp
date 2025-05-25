
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useFormHandlers } from "./useFormHandlers";
import { useExpenseMutation } from "./useExpenseMutation";
import { useFormInitializer } from "./useFormInitializer";
import type { Expense, ExpenseFormData } from "./types";

const initialFormData: ExpenseFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  description: "",
  amount: "",
  original_amount: "",
  account_id: "",
  chart_account_id: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
  supplier_id: "",
  category: "",
  currency: "MXN",
  exchange_rate: "1",
  isReturn: false, // Default to false
};

export function useExpenseForm(initialExpense?: Expense, onSuccess?: () => void) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({...initialFormData});
  const [accountCurrency, setAccountCurrency] = useState<string>("MXN"); 

  console.log("useExpenseForm initialized with onSuccess:", !!onSuccess);

  // Initialize form data if editing an existing expense
  useFormInitializer(initialExpense, setFormData, setAccountCurrency);

  // Get form field handlers
  const {
    setChartAccountId,
    handleReturnToggle,
    handleAccountChange,
    handleCurrencyChange,
    handleExchangeRateChange,
    handleOriginalAmountChange,
  } = useFormHandlers(setFormData, setAccountCurrency);

  // Get the mutation for creating or updating expenses
  const createOrUpdateExpense = useExpenseMutation(
    user, 
    initialExpense,
    formData,
    setFormData,
    initialFormData,
    setIsSubmitting,
    onSuccess
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit started");
    
    if (!user) {
      alert("Por favor inicia sesión para realizar esta acción");
      return;
    }

    if (!formData.chart_account_id) {
      alert("Por favor selecciona una cuenta contable");
      return;
    }

    if (!formData.original_amount || parseFloat(formData.original_amount) === 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    console.log("Form validation passed, setting isSubmitting to true");
    setIsSubmitting(true);
    
    try {
      console.log("Calling mutation with formData:", formData);
      await createOrUpdateExpense.mutateAsync(formData);
      console.log("Mutation completed successfully");
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    accountCurrency,
    isSubmitting,
    handleSubmit,
    setChartAccountId,
    handleAccountChange,
    handleCurrencyChange,
    handleExchangeRateChange,
    handleOriginalAmountChange,
    handleReturnToggle,
  };
}

export type { Expense, ExpenseFormData } from "./types";
