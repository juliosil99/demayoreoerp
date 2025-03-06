
import { BankAccountDialog } from "@/components/banking/BankAccountDialog";
import { BankAccountsTable } from "@/components/banking/BankAccountsTable";
import { BankingHeader } from "@/components/banking/BankingHeader";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function Banking() {
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
        onSave={handleAddAccount}
        account={newAccount}
        setAccount={setNewAccount}
        title="Agregar Nueva Cuenta"
        submitText="Agregar Cuenta"
        chartAccounts={[]}
      />

      <BankAccountDialog
        isOpen={isEditingAccount}
        onOpenChange={setIsEditingAccount}
        onSave={handleEditAccount}
        account={newAccount}
        setAccount={setNewAccount}
        title="Editar Cuenta"
        submitText="Guardar Cambios"
        chartAccounts={[]}
      />
    </div>
  );
}
