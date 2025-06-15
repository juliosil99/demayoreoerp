import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { NewBankAccount, BankAccount, AccountType, AccountCurrency } from "@/components/banking/types";
import { useUserCompany } from "@/hooks/useUserCompany";

export function useBankAccounts() {
  const queryClient = useQueryClient();
  const { data: userCompany } = useUserCompany();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<NewBankAccount>({
    name: "",
    type: "Bank",
    balance: 0,
    initial_balance: 0,
    balance_date: new Date().toISOString().split('T')[0],
    currency: "MXN"
  });

  // Fetch bank accounts - automatically filtered by RLS policies
  const { 
    data: accounts = [], 
    isLoading: isLoadingAccounts,
    error: accountsError 
  } = useQuery({
    queryKey: ["bank-accounts", userCompany?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order('type')
        .order('name');
        
      if (error) {
        console.error("Error fetching bank accounts:", error);
        throw error;
      }
      
      // Convert the type string to AccountType and ensure currency is of type AccountCurrency
      return data.map(account => ({
        ...account,
        type: account.type as AccountType,
        currency: (account.currency || "MXN") as AccountCurrency
      }));
    },
    enabled: !!userCompany?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache para cuentas bancarias
    gcTime: 15 * 60 * 1000, // 15 minutos en garbage collection
    refetchOnMount: true,
    retry: 2
  });

  // Add new bank account
  const addAccount = useMutation({
    mutationFn: async (account: NewBankAccount) => {
      if (!userCompany?.id) {
        throw new Error("No company found for user");
      }

      const { error } = await supabase
        .from("bank_accounts")
        .insert({
          name: account.name,
          type: account.type,
          balance: account.balance,
          initial_balance: account.initial_balance,
          balance_date: account.balance_date,
          currency: account.currency,
          company_id: userCompany.id,
          // Credit card specific fields
          payment_due_day: account.payment_due_day,
          statement_cut_day: account.statement_cut_day,
          credit_limit: account.credit_limit,
          minimum_payment_percentage: account.minimum_payment_percentage,
          // Loan specific fields
          monthly_payment: account.monthly_payment,
          total_term_months: account.total_term_months,
          remaining_months: account.remaining_months,
          original_loan_amount: account.original_loan_amount,
          loan_start_date: account.loan_start_date,
          // Common credit field
          interest_rate: account.interest_rate
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      setIsAddingAccount(false);
      toast.success("Cuenta bancaria agregada con éxito");
      setNewAccount({
        name: "",
        type: "Bank",
        balance: 0,
        initial_balance: 0,
        balance_date: new Date().toISOString().split('T')[0],
        currency: "MXN"
      });
    },
    onError: (error) => {
      console.error("Error creating bank account:", error);
      toast.error("Error al crear la cuenta: " + error.message);
    },
  });

  // Edit bank account
  const editAccount = useMutation({
    mutationFn: async (account: BankAccount) => {
      const { error } = await supabase
        .from("bank_accounts")
        .update({
          name: account.name,
          type: account.type,
          balance: account.balance,
          initial_balance: account.initial_balance,
          balance_date: account.balance_date,
          currency: account.currency,
          // Credit card specific fields
          payment_due_day: account.payment_due_day,
          statement_cut_day: account.statement_cut_day,
          credit_limit: account.credit_limit,
          minimum_payment_percentage: account.minimum_payment_percentage,
          // Loan specific fields
          monthly_payment: account.monthly_payment,
          total_term_months: account.total_term_months,
          remaining_months: account.remaining_months,
          original_loan_amount: account.original_loan_amount,
          loan_start_date: account.loan_start_date,
          // Common credit field
          interest_rate: account.interest_rate
        })
        .eq("id", account.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      setIsEditingAccount(false);
      toast.success("Cuenta bancaria actualizada con éxito");
    },
    onError: (error) => {
      console.error("Error updating bank account:", error);
      toast.error("Error al actualizar la cuenta: " + error.message);
    },
  });

  // Delete bank account
  const deleteAccount = useMutation({
    mutationFn: async (account: BankAccount) => {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", account.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Cuenta bancaria eliminada con éxito");
    },
    onError: (error) => {
      console.error("Error deleting bank account:", error);
      toast.error("Error al eliminar la cuenta: " + error.message);
    },
  });

  const handleAddAccount = (account: NewBankAccount) => {
    addAccount.mutate(account);
  };

  const handleEditAccount = (account: BankAccount) => {
    editAccount.mutate(account);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    if (window.confirm("¿Estás seguro de eliminar esta cuenta?")) {
      deleteAccount.mutate(account);
    }
  };

  const openEditDialog = (account: BankAccount) => {
    setNewAccount(account);
    setIsEditingAccount(true);
  };

  return {
    accounts,
    isLoadingAccounts,
    accountsError,
    isAddingAccount,
    setIsAddingAccount,
    isEditingAccount,
    setIsEditingAccount,
    newAccount,
    setNewAccount,
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
    openEditDialog,
    userCompany
  };
}
