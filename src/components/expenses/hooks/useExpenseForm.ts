
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string; currency: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

export type ExpenseFormData = {
  date: string;
  description: string;
  amount: string;
  original_amount: string;
  account_id: string;
  chart_account_id: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  supplier_id: string;
  category: string;
  currency: string;
  exchange_rate: string;
};

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
};

export function useExpenseForm(initialExpense?: Expense, onSuccess?: () => void) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({...initialFormData});
  const [accountCurrency, setAccountCurrency] = useState<string>("MXN"); 

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
        original_amount: initialExpense.original_amount?.toString() || initialExpense.amount.toString(),
        account_id: initialExpense.account_id.toString(),
        chart_account_id: initialExpense.chart_account_id,
        payment_method: initialExpense.payment_method,
        reference_number: initialExpense.reference_number || "",
        notes: initialExpense.notes || "",
        supplier_id: initialExpense.supplier_id || "",
        category: initialExpense.category || "",
        currency: initialExpense.currency || "MXN",
        exchange_rate: initialExpense.exchange_rate?.toString() || "1",
      });

      // Get the account currency
      if (initialExpense.bank_accounts?.currency) {
        setAccountCurrency(initialExpense.bank_accounts.currency);
      }
    }
  }, [initialExpense]);

  // Function to set the chart account ID directly
  const setChartAccountId = (chartAccountId: string) => {
    setFormData(prev => ({
      ...prev,
      chart_account_id: chartAccountId
    }));
  };

  // Function to handle account selection and fetch its currency
  const handleAccountChange = async (accountId: string) => {
    if (!accountId) {
      setAccountCurrency("MXN");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('currency')
        .eq('id', parseInt(accountId))
        .single();
      
      if (!error && data) {
        setAccountCurrency(data.currency);
        setFormData(prev => ({
          ...prev,
          account_id: accountId,
          currency: data.currency,
          exchange_rate: "1"
        }));
      }
    } catch (error) {
      console.error("Error fetching account currency:", error);
    }
  };

  // Function to handle currency change
  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, currency };
      
      // If the currency matches the account currency, reset exchange rate to 1
      if (currency === accountCurrency) {
        newFormData.exchange_rate = "1";
      }
      
      // Recalculate amounts if needed
      const originalAmount = parseFloat(newFormData.original_amount || "0");
      const exchangeRate = parseFloat(newFormData.exchange_rate || "1");
      
      if (originalAmount && exchangeRate) {
        if (currency !== "MXN") {
          // Convert to MXN
          newFormData.amount = (originalAmount * exchangeRate).toString();
        } else {
          // For MXN, original and converted amounts are the same
          newFormData.amount = newFormData.original_amount;
        }
      }
      
      return newFormData;
    });
  };

  // Function to handle exchange rate change
  const handleExchangeRateChange = (exchange_rate: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, exchange_rate };
      
      // Recalculate the MXN amount based on the new exchange rate
      const originalAmount = parseFloat(newFormData.original_amount || "0");
      const newExchangeRate = parseFloat(exchange_rate || "1");
      
      if (originalAmount && newExchangeRate && newFormData.currency !== "MXN") {
        // Convert to MXN
        newFormData.amount = (originalAmount * newExchangeRate).toString();
      }
      
      return newFormData;
    });
  };

  // Function to handle original amount change
  const handleOriginalAmountChange = (original_amount: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, original_amount };
      
      // Recalculate the MXN amount based on the exchange rate
      const newOriginalAmount = parseFloat(original_amount || "0");
      const exchangeRate = parseFloat(newFormData.exchange_rate || "1");
      
      if (newFormData.currency === "MXN") {
        // For MXN, the amount and original_amount are the same
        newFormData.amount = original_amount;
      } else if (newOriginalAmount && exchangeRate) {
        // Convert to MXN
        newFormData.amount = (newOriginalAmount * exchangeRate).toString();
      }
      
      return newFormData;
    });
  };

  const createOrUpdateExpense = useMutation({
    mutationFn: async (values: ExpenseFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const originalAmount = parseFloat(values.original_amount);
      const exchangeRate = parseFloat(values.exchange_rate);
      // Calculate the MXN amount if currency is not MXN
      const amount = values.currency === "MXN" 
        ? originalAmount 
        : originalAmount * exchangeRate;

      const expenseData = {
        user_id: user.id,
        date: values.date, // This is already in YYYY-MM-DD format from the input
        description: values.description,
        amount: amount,
        original_amount: originalAmount,
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

    if (!formData.original_amount || parseFloat(formData.original_amount) <= 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }

    setIsSubmitting(true);
    await createOrUpdateExpense.mutateAsync(formData);
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
  };
}
