
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import type { BankAccount, NewBankAccount } from "../types";
import { useAuth } from "@/contexts/AuthContext";

const emptyAccount: NewBankAccount = {
  name: "",
  type: "Bank", // Asignamos un valor válido por defecto
  balance: 0,
};

export function useBankAccounts() {
  const { user } = useAuth();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [newAccount, setNewAccount] = useState<NewBankAccount>(emptyAccount);

  const { data: accounts, isLoading: isLoadingAccounts, error: accountsError, refetch } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as BankAccount[];
    },
    enabled: !!user?.id,
  });

  const handleAddAccount = async () => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .insert([newAccount]);

      if (error) throw error;

      toast.success("Cuenta agregada exitosamente");
      setIsAddingAccount(false);
      setNewAccount(emptyAccount);
      refetch();
    } catch (error) {
      console.error("Error agregando cuenta:", error);
      toast.error("Fallo al agregar cuenta");
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;

    try {
      const { error } = await supabase
        .from("bank_accounts")
        .update({
          name: newAccount.name,
          type: newAccount.type,
          balance: newAccount.balance,
        })
        .eq("id", selectedAccount.id);

      if (error) throw error;

      toast.success("Cuenta actualizada exitosamente");
      setIsEditingAccount(false);
      setSelectedAccount(null);
      setNewAccount(emptyAccount);
      refetch();
    } catch (error) {
      console.error("Error actualizando cuenta:", error);
      toast.error("Fallo al actualizar cuenta");
    }
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      toast.success("Cuenta eliminada exitosamente");
      refetch();
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      toast.error("Fallo al eliminar cuenta");
    }
  };

  const openEditDialog = (account: BankAccount) => {
    setSelectedAccount(account);
    setNewAccount({
      name: account.name,
      type: account.type,
      balance: account.balance,
    });
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
  };
}
