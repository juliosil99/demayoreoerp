
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, FileText } from "lucide-react";
import { useAccountDetails } from "@/components/banking/hooks/useAccountDetails";
import { useAccountTransactions } from "@/components/banking/hooks/useAccountTransactions";
import { AccountHeader } from "@/components/banking/AccountHeader";
import { TransactionsTable } from "@/components/banking/TransactionsTable";
import { AccountSkeleton } from "@/components/banking/AccountSkeleton";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncAccountBalance } from "@/components/banking/hooks/useSyncAccountBalance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { BankStatementsDialog } from "@/components/banking/statements/BankStatementsDialog";

export default function BankAccountMovements() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statementsDialogOpen, setStatementsDialogOpen] = useState(false);

  // Validate accountId parameter
  const validAccountId = accountId && !isNaN(Number(accountId)) ? parseInt(accountId) : null;
  
  console.log('BankAccountMovements - accountId param:', accountId);
  console.log('BankAccountMovements - validAccountId:', validAccountId);

  // Force refresh data when the component mounts
  useEffect(() => {
    if (validAccountId) {
      queryClient.invalidateQueries({
        queryKey: ["bank-account", validAccountId]
      });
      queryClient.invalidateQueries({
        queryKey: ["account-transactions", validAccountId]
      });
    }
  }, [validAccountId, queryClient]);

  const handleBack = () => {
    navigate("/accounting/banking");
  };

  // Show error if accountId is invalid
  if (!accountId || !validAccountId) {
    console.error('Invalid accountId:', accountId);
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Cuentas Bancarias
        </Button>
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>ID de cuenta inválido</AlertTitle>
          <AlertDescription>
            El ID de la cuenta bancaria no es válido. Por favor, selecciona una cuenta desde la lista principal.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch account details
  const { 
    data: account, 
    isLoading: isLoadingAccount, 
    error: accountError 
  } = useAccountDetails(validAccountId);

  // Fetch transactions for this account
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    error: transactionsError 
  } = useAccountTransactions(validAccountId);

  // Use the synchronization hook to ensure balance is correct
  useSyncAccountBalance(account, transactions);

  // Handle errors in a user-friendly way
  if (accountError) {
    console.error('Account error:', accountError);
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Cuentas Bancarias
        </Button>
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Ocurrió un error al cargar los detalles de la cuenta. Error: {accountError.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoadingAccount) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <AccountSkeleton />
      </div>
    );
  }

  if (!account) {
    console.log('No account found for ID:', validAccountId);
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Cuentas Bancarias
        </Button>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Cuenta no encontrada</h2>
          <p className="text-muted-foreground">
            La cuenta que estás buscando no existe o no tienes acceso a ella.
          </p>
        </div>
      </div>
    );
  }

  // Handle transactions error
  if (transactionsError) {
    console.error('Transactions error:', transactionsError);
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Cuentas Bancarias
        </Button>
        <AccountHeader account={account} />
        <Alert variant="destructive" className="mt-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Ocurrió un error al cargar las transacciones. Error: {transactionsError.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Cuentas Bancarias
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setStatementsDialogOpen(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Estados de Cuenta
        </Button>
      </div>

      <AccountHeader account={account} />

      {isLoadingTransactions ? (
        <div className="space-y-4">
          <AccountSkeleton />
        </div>
      ) : (
        <TransactionsTable 
          account={account} 
          transactions={transactions || []} 
        />
      )}
      
      <BankStatementsDialog
        open={statementsDialogOpen}
        onOpenChange={setStatementsDialogOpen}
        accountId={account.id}
        accountName={account.name}
      />
    </div>
  );
}
