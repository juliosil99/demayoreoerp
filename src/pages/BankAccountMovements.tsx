
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountTransactions } from "@/components/banking/hooks/useAccountTransactions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ArrowLeftIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useMemo } from "react";

export default function BankAccountMovements() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const id = accountId ? parseInt(accountId) : null;

  // Fetch account details
  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ["bank-account", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch transactions for this account
  const { data: transactions, isLoading: isLoadingTransactions } = useAccountTransactions(id);

  // Calculate running balance for each transaction
  const transactionsWithBalance = useMemo(() => {
    if (!transactions || !account) return [];
    
    // Sort transactions by date (oldest first) to calculate running balance
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Start with the initial balance from the account
    const initialBalance = account.initial_balance || 0;
    let runningBalance = initialBalance;
    
    // Add running balance to each transaction
    return sortedTransactions.map((transaction) => {
      // Update running balance based on transaction type
      if (transaction.type === 'in') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      
      return {
        ...transaction,
        runningBalance
      };
    });
  }, [transactions, account]);

  const handleBack = () => {
    navigate("/accounting/banking");
  };

  if (isLoadingAccount) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-60" />
        <Skeleton className="h-8 w-96" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
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

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Movimientos de Cuenta</h1>
        <h2 className="text-xl">{account.name}</h2>
        <div className="flex flex-col md:flex-row md:gap-4">
          <p className="text-muted-foreground">
            <span className="font-medium">Saldo actual:</span> {formatCurrency(account.balance)}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">Saldo inicial:</span> {formatCurrency(account.initial_balance)} 
            <span className="ml-1">(desde {formatDate(account.balance_date)})</span>
          </p>
        </div>
      </div>

      {isLoadingTransactions ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : transactionsWithBalance && transactionsWithBalance.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Tipo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right font-medium">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Initial Balance Row */}
              <TableRow className="bg-muted/20">
                <TableCell>{formatDate(account.balance_date)}</TableCell>
                <TableCell className="font-medium">Saldo Inicial</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(account.initial_balance || 0)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(account.initial_balance || 0)}</TableCell>
              </TableRow>
              
              {/* Transaction Rows */}
              {transactionsWithBalance.map((transaction) => (
                <TableRow key={`${transaction.source}-${transaction.id}`} className="group hover:bg-muted/40 transition-colors">
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.reference}</TableCell>
                  <TableCell className="text-right">
                    {transaction.type === "in" ? (
                      <div className="flex items-center justify-end">
                        <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">Entrada</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-500">Salida</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={`text-right ${transaction.type === "in" ? "text-green-500" : "text-red-500"}`}>
                    {transaction.type === "in" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transaction.runningBalance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md">
          <h3 className="text-lg font-medium">No hay movimientos</h3>
          <p className="text-muted-foreground">
            Esta cuenta no tiene movimientos registrados.
          </p>
        </div>
      )}
    </div>
  );
}
