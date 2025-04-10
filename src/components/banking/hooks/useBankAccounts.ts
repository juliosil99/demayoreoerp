
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { NewBankAccount, BankAccount, AccountType, AccountCurrency } from "@/components/banking/types";

export function useBankAccounts() {
  const queryClient = useQueryClient();
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

  // Fetch bank accounts - modified to sort by type first, then by name
  const { 
    data: accounts = [], 
    isLoading: isLoadingAccounts,
    error: accountsError 
  } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      console.log("Fetching bank accounts data...");
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order('type')
        .order('name');
      if (error) throw error;
      
      // Log the fetched accounts for debugging
      console.log("Fetched bank accounts:", data);
      
      // Convert the type string to AccountType and ensure currency is of type AccountCurrency
      return data.map(account => ({
        ...account,
        type: account.type as AccountType,
        currency: (account.currency || "MXN") as AccountCurrency
      }));
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Consider data stale immediately
  });

  // Add new bank account
  const addAccount = useMutation({
    mutationFn: async (account: NewBankAccount) => {
      const { error } = await supabase
        .from("bank_accounts")
        .insert({
          name: account.name,
          type: account.type,
          balance: account.balance,
          initial_balance: account.initial_balance,
          balance_date: account.balance_date,
          currency: account.currency
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
          currency: account.currency
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
    openEditDialog
  };
}
