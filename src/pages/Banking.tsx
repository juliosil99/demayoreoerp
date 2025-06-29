import { BankAccountDialog } from "@/components/banking/BankAccountDialog";
import { BankAccountsTable } from "@/components/banking/BankAccountsTable";
import { BankingHeader } from "@/components/banking/BankingHeader";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { BankAccount, NewBankAccount, AccountCurrency } from "@/components/banking/types";
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
    userCompany,
  } = useBankAccounts();

  // Show error if no company is found
  if (!userCompany && !isLoadingAccounts) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Sin empresa</AlertTitle>
          <AlertDescription>
            No se encontró una empresa asociada a tu usuario. Contacta al administrador para que te asigne a una empresa.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error al cargar las cuentas: {accountsError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Ensure accounts are properly typed with AccountCurrency
  const typedAccounts: BankAccount[] = accounts.map(account => ({
    ...account,
    currency: (account.currency || "MXN") as AccountCurrency
  }));

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
          accounts={typedAccounts || []}
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
