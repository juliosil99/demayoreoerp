import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BanknoteIcon, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BankAccountDialog } from "@/components/banking/BankAccountDialog";
import { BankAccountsTable } from "@/components/banking/BankAccountsTable";

type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
  chart_account_id: string | null;
}

const emptyAccount = {
  name: "",
  type: "" as AccountType,
  balance: 0,
  chart_account_id: "",
};

export default function Banking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [newAccount, setNewAccount] = useState(emptyAccount);

  const { data: accounts, refetch } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*, chart_of_accounts (name, code)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user?.id,
  });

  const { data: chartAccounts } = useQuery({
    queryKey: ["chart-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .in("account_type", ["asset", "liability"])
        .order("code");

      if (error) throw error;
      return data;
    },
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
          chart_account_id: newAccount.chart_account_id || null,
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
      chart_account_id: account.chart_account_id || "",
    });
    setIsEditingAccount(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Gestión de Cuentas Bancarias</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/accounting/transfers")}
            className="w-full sm:w-auto"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Transferencias
          </Button>
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <BanknoteIcon className="mr-2 h-4 w-4" />
                Agregar Cuenta
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <BankAccountsTable
        accounts={accounts || []}
        onEdit={openEditDialog}
        onDelete={handleDeleteAccount}
      />

      <BankAccountDialog
        isOpen={isAddingAccount}
        onOpenChange={setIsAddingAccount}
        onSave={handleAddAccount}
        account={newAccount}
        setAccount={setNewAccount}
        title="Agregar Nueva Cuenta"
        submitText="Agregar Cuenta"
        chartAccounts={chartAccounts || []}
      />

      <BankAccountDialog
        isOpen={isEditingAccount}
        onOpenChange={setIsEditingAccount}
        onSave={handleEditAccount}
        account={newAccount}
        setAccount={setNewAccount}
        title="Editar Cuenta"
        submitText="Guardar Cambios"
        chartAccounts={chartAccounts || []}
      />
    </div>
  );
}
