
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useAccountDetails } from "@/components/banking/hooks/useAccountDetails";
import { useAccountTransactions } from "@/components/banking/hooks/useAccountTransactions";
import { AccountHeader } from "@/components/banking/AccountHeader";
import { TransactionsTable } from "@/components/banking/TransactionsTable";
import { AccountSkeleton } from "@/components/banking/AccountSkeleton";

export default function BankAccountMovements() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const id = accountId ? parseInt(accountId) : null;

  // Fetch account details
  const { data: account, isLoading: isLoadingAccount } = useAccountDetails(id);

  // Fetch transactions for this account
  const { data: transactions, isLoading: isLoadingTransactions } = useAccountTransactions(id);

  const handleBack = () => {
    navigate("/accounting/banking");
  };

  if (isLoadingAccount) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <AccountSkeleton />
      </div>
    );
  }

  if (!account) {
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Volver a Cuentas Bancarias
      </Button>

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
    </div>
  );
}
