
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { NewBankAccount, BankAccount, AccountType } from "@/components/banking/types";

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
  });

  // Fetch bank accounts
  const { 
    data: accounts = [], 
    isLoading: isLoadingAccounts,
    error: accountsError 
  } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("name");
      if (error) throw error;
      
      // Convert the type string to AccountType
      return data.map(account => ({
        ...account,
        type: account.type as AccountType
      }));
    },
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
          balance_date: account.balance_date
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
          balance_date: account.balance_date
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
