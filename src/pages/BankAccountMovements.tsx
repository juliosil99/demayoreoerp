
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
        <p className="text-muted-foreground">
          Saldo actual: {formatCurrency(account.balance)}
        </p>
        <p className="text-muted-foreground">
          Saldo inicial: {formatCurrency(account.initial_balance)} (desde {formatDate(account.balance_date)})
        </p>
      </div>

      {isLoadingTransactions ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Tipo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={`${transaction.source}-${transaction.id}`}>
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
