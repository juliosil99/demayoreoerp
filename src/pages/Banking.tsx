
import { BankAccountDialog } from "@/components/banking/BankAccountDialog";
import { BankAccountsTable } from "@/components/banking/BankAccountsTable";
import { BankingHeader } from "@/components/banking/BankingHeader";
import { useBankAccounts } from "@/components/banking/hooks/useBankAccounts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Banking() {
  const {
    accounts,
    isLoadingAccounts,
    accountsError,
    chartAccounts,
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
