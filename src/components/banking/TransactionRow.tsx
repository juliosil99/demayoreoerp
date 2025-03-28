
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: "in" | "out";
  amount: number;
  runningBalance: number | null;
  beforeInitialDate?: boolean;
}

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  return (
    <TableRow 
      className={`group hover:bg-muted/40 transition-colors ${transaction.beforeInitialDate ? 'opacity-60' : ''}`}
    >
      <TableCell>{formatDate(transaction.date)}</TableCell>
      <TableCell>
        {transaction.description}
        {transaction.beforeInitialDate && (
          <span className="ml-2 text-xs text-amber-600 font-medium">
            (Previo al saldo inicial)
          </span>
        )}
      </TableCell>
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
        {transaction.beforeInitialDate ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          formatCurrency(transaction.runningBalance)
        )}
      </TableCell>
    </TableRow>
  );
}
