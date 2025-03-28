
import { BankAccountDialog } from "@/components/banking/BankAccountDialog";
import { BankAccountsTable } from "@/components/banking/BankAccountsTable";
import { BankingHeader } from "@/components/banking/BankingHeader";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { BankAccount, NewBankAccount } from "@/components/banking/types";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Banking() {
  const queryClient = useQueryClient();
  const {
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
  } = useBankAccounts();

  // Force refresh bank accounts data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    
    // This will force the system to recalculate balances for all accounts
    accounts.forEach(account => {
      queryClient.invalidateQueries({ queryKey: ["account-transactions", account.id] });
      queryClient.invalidateQueries({ queryKey: ["bank-account", account.id] });
    });
  }, [queryClient, accounts]);

  if (accountsError) {
    return (
      <div className="p-4 text-red-500">
        Error al cargar las cuentas. Por favor, intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BankingHeader onAddAccount={() => setIsAddingAccount(true)} />

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Saldos iniciales</AlertTitle>
        <AlertDescription>
          Ahora puedes registrar el saldo inicial y la fecha para cada cuenta bancaria. 
          Esto ayudará a rastrear correctamente todos los movimientos a partir de esa fecha.
        </AlertDescription>
      </Alert>

      {isLoadingAccounts ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <BankAccountsTable
          accounts={accounts || []}
          onEdit={openEditDialog}
          onDelete={handleDeleteAccount}
        />
      )}

      <BankAccountDialog
        isOpen={isAddingAccount}
        onOpenChange={setIsAddingAccount}
        onSave={(account) => handleAddAccount(account as NewBankAccount)}
        account={newAccount}
        setAccount={setNewAccount}
        title="Agregar Nueva Cuenta"
        submitText="Agregar Cuenta"
        chartAccounts={[]}
      />

      <BankAccountDialog
        isOpen={isEditingAccount}
        onOpenChange={setIsEditingAccount}
        onSave={(account) => handleEditAccount(account as BankAccount)}
        account={newAccount}
        setAccount={setNewAccount}
        title="Editar Cuenta"
        submitText="Guardar Cambios"
        chartAccounts={[]}
      />
    </div>
  );
}
